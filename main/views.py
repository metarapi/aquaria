from django.shortcuts import render


def home(request):
    return render(request, 'main/home.html')

# Will display the three.js scenes
def scenes(request):
    return render(request, 'main/scenes.html')