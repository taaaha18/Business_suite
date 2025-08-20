# urls.py (add these to your existing urls.py)
from django.urls import path
from . import views


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

      # Add these new Job Application imports
    JobApplicationListCreateView,
    JobApplicationDetailView,
    JobApplicationSearchView,
    JobApplicationByBDView,
    JobApplicationStatsView,
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
     path('developers/email/<str:email>/', views.get_developer_by_email, name='developer-by-email'),


    # BD URLs
    path('bds/', BDListCreateView.as_view(), name='bd-list-create'),
    path('bds/<str:bd_id>/', BDDetailView.as_view(), name='bd-detail'),
    path('bds/search/', BDSearchView.as_view(), name='bd-search'),
    path('bds/group/location/', BDByLocationView.as_view(), name='bd-by-location'),
    path('bds/group/experience/', BDByExperienceView.as_view(), name='bd-by-experience'),

     # Job Application management endpoints
    path('job-applications/', JobApplicationListCreateView.as_view(), name='job-application-list-create'),
    path('job-applications/<int:job_id>/', JobApplicationDetailView.as_view(), name='job-application-detail'),
    path('job-applications/search/', JobApplicationSearchView.as_view(), name='job-application-search'),
    path('job-applications/by-bd/', JobApplicationByBDView.as_view(), name='job-applications-by-bd'),
    path('job-applications/stats/', JobApplicationStatsView.as_view(), name='job-application-stats'),



 path('interview-schedules/', views.interview_schedule_list_create, name='interview-schedule-list-create'),
    path('interview-schedules/<int:interview_id>/', views.interview_schedule_detail, name='interview-schedule-detail'),
    
    # Additional endpoints for Interview Schedules
    path('interview-schedules/developer/<str:dev_id>/', views.interview_schedules_by_developer, name='interview-schedules-by-developer'),
    path('interview-schedules/bd/<str:bd_id>/', views.interview_schedules_by_bd, name='interview-schedules-by-bd'),
    
    # Keep existing Interview URLs if needed
    path('interviews/', views.interview_schedule_list_create, name='interview-list-create'),
    path('interviews/<int:interview_id>/', views.interview_schedule_detail, name='interview-detail'),
    path('interviews/developer/<str:dev_id>/', views.interview_schedules_by_developer, name='interviews-by-developer'),
    path('interviews/bd/<str:bd_id>/', views.interview_schedules_by_bd, name='interviews-by-bd'),
]