# Aquaria Project

Aquaria is a web-based 3D visualization project that leverages Three.js for rendering 3D scenes and HTMX for dynamic HTML updates. Three example scenes are available: 

1. Lorenz attractor animation
2. Animated periodic simplex noise (adapted from [here](https://github.com/stegu/webgl-noise)) on a plane mesh
3. Animated [Gerstner waves](https://www.wikiwand.com/en/Trochoidal_wave) on a plane mesh

All three scenes have variable inputs, either through a bootstrap range slider or the [dat.gui](https://github.com/dataarts/dat.gui) interface.

## Getting Started

### Prerequisites

- Python 3.11

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/aquaria.git
    cd aquaria
    ```

2. Install Python dependencies:
    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    ```

### Running the Project

1. Start the Django server:
    ```sh
    python manage.py runserver
    ```

3. Open your browser and navigate to `http://localhost:8000`.
