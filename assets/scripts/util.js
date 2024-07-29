/**
 * Generates 2D periodic simplex noise with a given period and rotation.
 *
 * @param {number[]} x - A 2D coordinate array [x0, x1].
 * @param {number[]} period - A 2D array specifying the period [period0, period1].
 * @param {number} alpha - A rotation angle.
 * @returns {{ value: number, gradient: number[] }} - The noise value and its gradient.
 */

function psrdnoise2(x, period, alpha) {
    // Transform to simplex space (axis-aligned hexagonal grid)
    const uv = [x[0] + x[1] * 0.5, x[1]];

    // Determine which simplex we're in, with i0 being the "base"
    const i0 = [Math.floor(uv[0]), Math.floor(uv[1])];
    const f0 = [uv[0] - i0[0], uv[1] - i0[1]];
    // o1 is the offset in simplex space to the second corner
    const cmp = f0[1] < f0[0] ? 1.0 : 0.0;
    const o1 = [cmp, 1.0 - cmp];

    // Enumerate the remaining simplex corners
    const i1 = [i0[0] + o1[0], i0[1] + o1[1]];
    const i2 = [i0[0] + 1.0, i0[1] + 1.0];

    // Transform corners back to texture space
    const v0 = [i0[0] - i0[1] * 0.5, i0[1]];
    const v1 = [v0[0] + o1[0] - o1[1] * 0.5, v0[1] + o1[1]];
    const v2 = [v0[0] + 0.5, v0[1] + 1.0];

    // Compute vectors from v to each of the simplex corners
    const x0 = [x[0] - v0[0], x[1] - v0[1]];
    const x1 = [x[0] - v1[0], x[1] - v1[1]];
    const x2 = [x[0] - v2[0], x[1] - v2[1]];

    let iu, iv;
    let xw, yw;

    // Wrap to periods, if desired
    if (period[0] > 0.0 || period[1] > 0.0) {
        xw = [v0[0], v1[0], v2[0]];
        yw = [v0[1], v1[1], v2[1]];
        if (period[0] > 0.0) xw = xw.map(v => v % period[0]);
        if (period[1] > 0.0) yw = yw.map(v => v % period[1]);
        // Transform back to simplex space and fix rounding errors
        iu = xw.map((v, i) => Math.floor(v + 0.5 * yw[i] + 0.5));
        iv = yw.map(v => Math.floor(v + 0.5));
    } else { // Shortcut if neither x nor y periods are specified
        iu = [i0[0], i1[0], i2[0]];
        iv = [i0[1], i1[1], i2[1]];
    }

    // Compute one pseudo-random hash value for each corner
    let hash = iu.map((v, i) => (v % 289.0 + iv[i]) % 289.0);
    hash = hash.map(v => ((v * 51.0 + 2.0) * v + iv[hash.indexOf(v)]) % 289.0);
    hash = hash.map(v => ((v * 34.0 + 10.0) * v) % 289.0);

    // Pick a pseudo-random angle and add the desired rotation
    const psi = hash.map(v => v * 0.07482 + alpha);
    const gx = psi.map(Math.cos);
    const gy = psi.map(Math.sin);

    // Reorganize for dot products below
    const g0 = [gx[0], gy[0]];
    const g1 = [gx[1], gy[1]];
    const g2 = [gx[2], gy[2]];

    // Radial decay with distance from each simplex corner
    const w = [0.8 - dot(x0, x0), 0.8 - dot(x1, x1), 0.8 - dot(x2, x2)];
    const w2 = w.map(v => Math.max(v, 0.0) ** 2);
    const w4 = w2.map(v => v ** 2);

    // The value of the linear ramp from each of the corners
    const gdotx = [dot(g0, x0), dot(g1, x1), dot(g2, x2)];

    // Multiply by the radial decay and sum up the noise value
    const n = dot(w4, gdotx);

    // Compute the first order partial derivatives
    const w3 = w2.map(v => v ** 1.5);
    const dw = w3.map((v, i) => -8.0 * v * gdotx[i]);
    const dn0 = add(mul(w4[0], g0), mul(dw[0], x0));
    const dn1 = add(mul(w4[1], g1), mul(dw[1], x1));
    const dn2 = add(mul(w4[2], g2), mul(dw[2], x2));
    const gradient = mul(10.9, add(add(dn0, dn1), dn2));

    // Scale the return value to fit nicely into the range [-1,1]
    return { value: 10.9 * n, gradient: gradient };
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}

function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
}

function mul(a, b) {
    return [a * b[0], a * b[1]];
}

export { psrdnoise2 };