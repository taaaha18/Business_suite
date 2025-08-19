# urls.py (add these to your existing urls.py)

from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    ClientListCreateView, 
    ClientDetailView,
    DeveloperDataListCreateView,
    DeveloperDataDetailView,
    DeveloperDataSearchView,

    # Add these new BD imports
    BDListCreateView,
    BDDetailView,
    BDSearchView,
    BDByLocationView,
    BDByExperienceView,
)

urlpatterns = [
    # Authentication endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    
    # Client management endpoints
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:client_id>/', ClientDetailView.as_view(), name='client-detail'),
    
    # Developer data management endpoints
    path('developers/', DeveloperDataListCreateView.as_view(), name='developer-list-create'),
    path('developers/<str:office_id>/', DeveloperDataDetailView.as_view(), name='developer-detail'),
    path('developers/search/', DeveloperDataSearchView.as_view(), name='developer-search'),


    # BD URLs
    path('bds/', BDListCreateView.as_view(), name='bd-list-create'),
    path('bds/<str:bd_id>/', BDDetailView.as_view(), name='bd-detail'),
    path('bds/search/', BDSearchView.as_view(), name='bd-search'),
    path('bds/group/location/', BDByLocationView.as_view(), name='bd-by-location'),
    path('bds/group/experience/', BDByExperienceView.as_view(), name='bd-by-experience'),
]