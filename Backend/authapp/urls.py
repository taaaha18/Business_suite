from django.urls import path
from .views import RegisterView, LoginView, ClientListCreateView, ClientDetailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
      path('login/', LoginView.as_view(), name='login'),

    # Client Management URLs
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<str:client_id>/', ClientDetailView.as_view(), name='client-detail'),
]
