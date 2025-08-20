# views.py - Corrected BD Management Views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from .models import Admin, Developer, Client, Developer_data, BD,JobApplication,InterviewSchedule
from django.shortcuts import get_object_or_404
import logging
from .serializers import RegisterSerializer, LoginSerializer, ClientSerializer, DeveloperDataSerializer, BDSerializer,JobApplicationSerializer, JobApplicationListSerializer,InterviewScheduleSerializer
from rest_framework.decorators import api_view



from django.utils import timezone

from django.db import transaction



# Set up logging
logger = logging.getLogger(__name__)

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            return Response(data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------- Client Management Views --------
class ClientListCreateView(APIView):
    def get(self, request):
        try:
            clients = Client.objects.all().order_by('-client_id')
            serializer = ClientSerializer(clients, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to retrieve clients',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = ClientSerializer(data=request.data)
            if serializer.is_valid():
                client = serializer.save()
                return Response({
                    'message': 'Client created successfully',
                    'client': ClientSerializer(client).data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Failed to create client',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClientDetailView(APIView):
    def get_client(self, client_id):
        try:
            return Client.objects.get(client_id=client_id)
        except Client.DoesNotExist:
            return None

    def get(self, request, client_id):
        client = self.get_client(client_id)
        if not client:
            return Response({
                'error': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ClientSerializer(client)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, client_id):
        client = self.get_client(client_id)
        if not client:
            return Response({
                'error': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ClientSerializer(client, data=request.data)
        if serializer.is_valid():
            updated_client = serializer.save()
            return Response({
                'message': 'Client updated successfully',
                'client': ClientSerializer(updated_client).data
            }, status=status.HTTP_200_OK)
        return Response({
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, client_id):
        client = self.get_client(client_id)
        if not client:
            return Response({
                'error': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)

        client_name = client.client_name
        client.delete()
        return Response({
            'message': f'Client "{client_name}" deleted successfully'
        }, status=status.HTTP_200_OK)


# -------- Developer Data Management Views --------
class DeveloperDataListCreateView(APIView):
    def get(self, request):
        try:
            developers = Developer_data.objects.all().order_by('-created_at')
            serializer = DeveloperDataSerializer(developers, many=True)
            return Response({
                'success': True,
                'count': len(serializer.data),
                'developers': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Failed to retrieve developers',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = DeveloperDataSerializer(data=request.data)
            if serializer.is_valid():
                developer = serializer.save()
                return Response({
                    'success': True,
                    'message': 'Developer created successfully',
                    'developer': DeveloperDataSerializer(developer).data
                }, status=status.HTTP_201_CREATED)
            return Response({
                'success': False,
                'error': 'Validation failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to create developer',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DeveloperDataDetailView(APIView):
    def get_developer(self, office_id):
        try:
            return Developer_data.objects.get(office_id=office_id)
        except Developer_data.DoesNotExist:
            return None

    def get(self, request, office_id):
        developer = self.get_developer(office_id)
        if not developer:
            return Response({
                'success': False,
                'error': 'Developer not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = DeveloperDataSerializer(developer)
        return Response({
            'success': True,
            'developer': serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request, office_id):
        developer = self.get_developer(office_id)
        if not developer:
            return Response({
                'success': False,
                'error': 'Developer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = DeveloperDataSerializer(developer, data=request.data, partial=True)
        if serializer.is_valid():
            updated_developer = serializer.save()
            return Response({
                'success': True,
                'message': 'Developer updated successfully',
                'developer': DeveloperDataSerializer(updated_developer).data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, office_id):
        developer = self.get_developer(office_id)
        if not developer:
            return Response({
                'success': False,
                'error': 'Developer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = DeveloperDataSerializer(developer, data=request.data, partial=True)
        if serializer.is_valid():
            updated_developer = serializer.save()
            return Response({
                'success': True,
                'message': 'Developer updated successfully',
                'developer': DeveloperDataSerializer(updated_developer).data
            }, status=status.HTTP_200_OK)
        return Response({
            'success': False,
            'error': 'Validation failed',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, office_id):
        developer = self.get_developer(office_id)
        if not developer:
            return Response({
                'success': False,
                'error': 'Developer not found'
            }, status=status.HTTP_404_NOT_FOUND)

        developer_name = developer.full_name
        developer.delete()
        return Response({
            'success': True,
            'message': f'Developer "{developer_name}" (Office ID: {office_id}) deleted successfully'
        }, status=status.HTTP_200_OK)


class DeveloperDataSearchView(APIView):
    def get(self, request):
        try:
            queryset = Developer_data.objects.all()
            
            # Search by name
            name = request.query_params.get('name', None)
            if name:
                queryset = queryset.filter(
                    firstName__icontains=name
                ) | queryset.filter(
                    lastName__icontains=name
                )
            
            # Filter by experience
            experience = request.query_params.get('experience', None)
            if experience:
                queryset = queryset.filter(experience=experience)
            
            # Filter by availability
            availability = request.query_params.get('availability', None)
            if availability:
                queryset = queryset.filter(availability=availability)
            
            # Filter by location
            location = request.query_params.get('location', None)
            if location:
                queryset = queryset.filter(location__icontains=location)
            
            # Filter by skills
            skills = request.query_params.get('skills', None)
            if skills:
                queryset = queryset.filter(technicalSkills__icontains=skills)
            
            serializer = DeveloperDataSerializer(queryset, many=True)
            return Response({
                'success': True,
                'count': len(serializer.data),
                'developers': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Search failed',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------- BD Management Views (CORRECTED) --------
class BDListCreateView(APIView):
    """
    Handle GET (list all BDs) and POST (create new BD)
    """
    
    def get(self, request):
        """Get all BDs - Return simple array format to match frontend expectation"""
        try:
            bds = BD.objects.all().order_by('-created_at')
            serializer = BDSerializer(bds, many=True)
            # Return simple array format that matches frontend expectation
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving BDs: {str(e)}")
            return Response({
                'error': 'Failed to retrieve BDs',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Create new BD - Return simple format matching frontend expectation"""
        try:
            logger.info(f"Creating BD with data: {request.data}")
            
            serializer = BDSerializer(data=request.data)
            if serializer.is_valid():
                bd = serializer.save()
                logger.info(f"BD created successfully: {bd.BD_id}")
                
                # Return simple format that matches frontend expectation
                response_data = BDSerializer(bd).data
                return Response(response_data, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"BD validation failed: {serializer.errors}")
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating BD: {str(e)}")
            return Response({
                'error': 'Failed to create BD',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BDDetailView(APIView):
    """
    Handle GET, PUT, DELETE for individual BD by BD_id
    """
    
    def get_bd(self, bd_id):
        """Helper method to get BD by BD_id"""
        try:
            return BD.objects.get(BD_id=bd_id)
        except BD.DoesNotExist:
            return None

    def get(self, request, bd_id):
        """Get single BD by BD_id"""
        bd = self.get_bd(bd_id)
        if not bd:
            return Response({
                'error': 'BD not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = BDSerializer(bd)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, bd_id):
        """Update BD by BD_id"""
        bd = self.get_bd(bd_id)
        if not bd:
            return Response({
                'error': 'BD not found'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            logger.info(f"Updating BD {bd_id} with data: {request.data}")
            
            serializer = BDSerializer(bd, data=request.data, partial=True)
            if serializer.is_valid():
                updated_bd = serializer.save()
                logger.info(f"BD updated successfully: {bd_id}")
                
                # Return simple format
                response_data = BDSerializer(updated_bd).data
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                logger.error(f"BD update validation failed: {serializer.errors}")
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error updating BD: {str(e)}")
            return Response({
                'error': 'Failed to update BD',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, bd_id):
        """Delete BD by BD_id"""
        bd = self.get_bd(bd_id)
        if not bd:
            return Response({
                'error': 'BD not found'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            bd_name = bd.name
            bd.delete()
            logger.info(f"BD deleted successfully: {bd_id}")
            return Response({
                'message': f'BD "{bd_name}" deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error deleting BD: {str(e)}")
            return Response({
                'error': 'Failed to delete BD',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# -------- Additional BD Views --------
class BDSearchView(APIView):
    def get(self, request):
        try:
            queryset = BD.objects.all()
            
            # Search by name
            name = request.query_params.get('name', None)
            if name:
                queryset = queryset.filter(name__icontains=name)
            
            # Filter by experience
            experience = request.query_params.get('experience', None)
            if experience:
                queryset = queryset.filter(experience=experience)
            
            # Filter by availability
            availability = request.query_params.get('availability', None)
            if availability:
                queryset = queryset.filter(availability=availability)
            
            # Filter by location
            location = request.query_params.get('location', None)
            if location:
                queryset = queryset.filter(location__icontains=location)
            
            serializer = BDSerializer(queryset, many=True)
            return Response({
                'success': True,
                'count': len(serializer.data),
                'bds': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Search failed',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BDByLocationView(APIView):
    def get(self, request):
        try:
            locations = BD.objects.values_list('location', flat=True).distinct()
            location_data = {}
            
            for location in locations:
                bds_in_location = BD.objects.filter(location=location)
                serializer = BDSerializer(bds_in_location, many=True)
                location_data[location] = {
                    'count': len(serializer.data),
                    'bds': serializer.data
                }
            
            return Response({
                'success': True,
                'locations': location_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to retrieve BDs by location',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class BDByExperienceView(APIView):
    def get(self, request):
        try:
            experience_levels = BD.objects.values_list('experience', flat=True).distinct()
            experience_data = {}
            
            for experience in experience_levels:
                bds_with_experience = BD.objects.filter(experience=experience)
                serializer = BDSerializer(bds_with_experience, many=True)
                experience_data[experience] = {
                    'count': len(serializer.data),
                    'bds': serializer.data
                }
            
            return Response({
                'success': True,
                'experience_levels': experience_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': 'Failed to retrieve BDs by experience',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

###########JOB###########
# Add these imports to your existing views.py file
# from .models import JobApplication
# from .serializers import JobApplicationSerializer, JobApplicationListSerializer

# -------- Job Application Management Views --------
class JobApplicationListCreateView(APIView):
    """
     Handle GET (list all job applications) and POST (create new job application)
    """
    
    # Add this method to see what methods are allowed
    def options(self, request, *args, **kwargs):
        """
        Handle preflight requests and show allowed methods
        """
        response = Response()
        response['Allow'] = 'GET, POST, OPTIONS'
        return response
    
    def get(self, request):
        """Get all job applications with debugging"""
        try:
            # Debug logging
            logger.info("=== JobApplicationListCreateView GET method called ===")
            logger.info(f"Request method: {request.method}")
            logger.info(f"Request path: {request.path}")
            logger.info(f"Query params: {request.query_params}")
            
            # Check if JobApplication model exists and has data
            try:
                from .models import JobApplication
                total_count = JobApplication.objects.count()
                logger.info(f"Total JobApplications in database: {total_count}")
            except Exception as model_error:
                logger.error(f"Error accessing JobApplication model: {model_error}")
                return Response({
                    'success': False,
                    'error': 'Database model error',
                    'message': str(model_error)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get query parameters for filtering
            bd_id = request.query_params.get('bd_id', None)
            status_filter = request.query_params.get('status', None)
            company = request.query_params.get('company', None)
            
            queryset = JobApplication.objects.all().order_by('-created_at')
            logger.info(f"Base queryset count: {queryset.count()}")
            
            # Apply filters if provided
            if bd_id:
                try:
                    # Check if BD exists
                    from .models import BD
                    bd_exists = BD.objects.filter(BD_id=bd_id).exists()
                    if not bd_exists:
                        return Response({
                            'success': False,
                            'error': f'BD with ID {bd_id} does not exist',
                            'count': 0,
                            'jobs': []
                        }, status=status.HTTP_400_BAD_REQUEST)
                    
                    queryset = queryset.filter(bd_id__BD_id=bd_id)
                    logger.info(f"After BD filter: {queryset.count()}")
                except Exception as filter_error:
                    logger.error(f"Error filtering by BD: {filter_error}")
                    
            if status_filter:
                queryset = queryset.filter(application_status=status_filter)
                logger.info(f"After status filter: {queryset.count()}")
                
            if company:
                queryset = queryset.filter(company__icontains=company)
                logger.info(f"After company filter: {queryset.count()}")
            
            # Check if any jobs exist
            if not queryset.exists():
                logger.info("No job applications found after filtering")
                return Response({
                    'success': True,
                    'message': 'No job applications found',
                    'count': 0,
                    'jobs': []
                }, status=status.HTTP_200_OK)
            
            # Serialize the data
            from .serializers import JobApplicationListSerializer
            serializer = JobApplicationListSerializer(queryset, many=True)
            logger.info(f"Serialized {len(serializer.data)} job applications")
            
            # Log sample data if exists
            if serializer.data:
                logger.info(f"Sample job data: {serializer.data[0] if serializer.data else 'None'}")
            
            response_data = {
                'success': True,
                'count': len(serializer.data),
                'jobs': serializer.data
            }
            
            logger.info("=== GET method completed successfully ===")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"=== ERROR in GET method ===")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error message: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            return Response({
                'success': False,
                'error': 'Failed to retrieve job applications',
                'message': str(e),
                'count': 0,
                'jobs': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def post(self, request):
        """Create new job application"""
        try:
            logger.info(f"Creating job application with data: {request.data}")
            
            # Handle bdId to bd_id conversion from frontend
            data = request.data.copy()
            if 'bdId' in data:
                bd_id_value = data.pop('bdId')
                # Get the BD instance
                try:
                    bd_instance = BD.objects.get(BD_id=bd_id_value)
                    data['bd_id'] = bd_instance.pk
                except BD.DoesNotExist:
                    return Response({
                        'success': False,
                        'error': 'Invalid BD ID',
                        'message': f'BD with ID {bd_id_value} does not exist'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Handle field name conversions from frontend form
            field_mappings = {
                'jobTitle': 'job_title',
                'salaryRange': 'salary_range',
                'jobType': 'job_type',
                'experienceLevel': 'experience_level',
                'jobUrl': 'job_url',
                'jobDescription': 'job_description',
                'keyRequirements': 'key_requirements',
                'personalNotes': 'personal_notes'
            }
            
            for frontend_field, backend_field in field_mappings.items():
                if frontend_field in data:
                    data[backend_field] = data.pop(frontend_field)
            
            serializer = JobApplicationSerializer(data=data)
            if serializer.is_valid():
                job = serializer.save()
                logger.info(f"Job application created successfully: {job.job_id}")
                
                return Response({
                    'success': True,
                    'message': 'Job application saved successfully!',
                    'data': JobApplicationSerializer(job).data
                }, status=status.HTTP_201_CREATED)
            else:
                logger.error(f"Job application validation failed: {serializer.errors}")
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error creating job application: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to create job application',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JobApplicationDetailView(APIView):
    """
    Handle GET, PUT, DELETE for individual job application by job_id
    """
    
    def get_job(self, job_id):
        """Helper method to get job by job_id"""
        try:
            return JobApplication.objects.get(job_id=job_id)
        except JobApplication.DoesNotExist:
            return None

    def get(self, request, job_id):
        """Get single job application by job_id"""
        job = self.get_job(job_id)
        if not job:
            return Response({
                'success': False,
                'error': 'Job application not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = JobApplicationSerializer(job)
        return Response({
            'success': True,
            'job': serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request, job_id):
        """Update job application by job_id"""
        job = self.get_job(job_id)
        if not job:
            return Response({
                'success': False,
                'error': 'Job application not found'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            logger.info(f"Updating job application {job_id} with data: {request.data}")
            
            # Handle field name conversions from frontend form
            data = request.data.copy()
            field_mappings = {
                'jobTitle': 'job_title',
                'salaryRange': 'salary_range',
                'jobType': 'job_type',
                'experienceLevel': 'experience_level',
                'jobUrl': 'job_url',
                'jobDescription': 'job_description',
                'keyRequirements': 'key_requirements',
                'personalNotes': 'personal_notes'
            }
            
            for frontend_field, backend_field in field_mappings.items():
                if frontend_field in data:
                    data[backend_field] = data.pop(frontend_field)
            
            # Handle bdId to bd_id conversion
            if 'bdId' in data:
                bd_id_value = data.pop('bdId')
                try:
                    bd_instance = BD.objects.get(BD_id=bd_id_value)
                    data['bd_id'] = bd_instance.pk
                except BD.DoesNotExist:
                    return Response({
                        'success': False,
                        'error': 'Invalid BD ID',
                        'message': f'BD with ID {bd_id_value} does not exist'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = JobApplicationSerializer(job, data=data, partial=True)
            if serializer.is_valid():
                updated_job = serializer.save()
                logger.info(f"Job application updated successfully: {job_id}")
                
                return Response({
                    'success': True,
                    'message': 'Job application updated successfully',
                    'job': JobApplicationSerializer(updated_job).data
                }, status=status.HTTP_200_OK)
            else:
                logger.error(f"Job application update validation failed: {serializer.errors}")
                return Response({
                    'success': False,
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error updating job application: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to update job application',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, job_id):
        """Partial update job application by job_id"""
        return self.put(request, job_id)  # Use the same logic for PATCH

    def delete(self, request, job_id):
        """Delete job application by job_id"""
        job = self.get_job(job_id)
        if not job:
            return Response({
                'success': False,
                'error': 'Job application not found'
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            job_title = job.job_title
            company = job.company
            job.delete()
            logger.info(f"Job application deleted successfully: {job_id}")
            return Response({
                'success': True,
                'message': f'Job application "{job_title}" at {company} deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error deleting job application: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to delete job application',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class JobApplicationSearchView(APIView):
    """
    Search and filter job applications
    """
    def get(self, request):
        """Get all job applications with debugging"""
        try:
            logger.info("=== JobApplicationSearchView GET method called ===")
        
            queryset = JobApplication.objects.all().order_by('-created_at')
        
            # Apply filters
            bd_id = request.query_params.get('bd_id', None)
            status_filter = request.query_params.get('status', None)
            company = request.query_params.get('company', None)

            if bd_id:
                queryset = queryset.filter(bd_id__BD_id=bd_id)
            if status_filter:
                queryset = queryset.filter(application_status=status_filter)
            if company:
                queryset = queryset.filter(company__icontains=company)

            # Serialize data
            from .serializers import JobApplicationListSerializer
            serializer = JobApplicationListSerializer(queryset, many=True)

            # ✅ Print jobs to console (for debugging)
            print("=== Jobs Retrieved ===")
            for job in serializer.data:
                print(job)  # each job will be a dict
            print("======================")

            # ✅ Or use logger (recommended for production)
            logger.info(f"Jobs retrieved: {serializer.data}")

            return Response({
                'success': True,
                'count': len(serializer.data),
                'jobs': serializer.data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in JobApplicationSearchView GET method: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to retrieve job applications',
                'message': str(e),
                'count': 0,
                'jobs': []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JobApplicationByBDView(APIView):
    """
    Get job applications grouped by BD
    """
    def get(self, request):
        try:
            bds = BD.objects.all()
            bd_data = {}
            
            for bd in bds:
                jobs = JobApplication.objects.filter(bd_id=bd).order_by('-created_at')
                serializer = JobApplicationListSerializer(jobs, many=True)
                bd_data[bd.BD_id] = {
                    'bd_info': {
                        'bd_id': bd.BD_id,
                        'name': bd.name,
                        'email': bd.email
                    },
                    'job_count': len(serializer.data),
                    'jobs': serializer.data
                }
            
            return Response({
                'success': True,
                'bds': bd_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving job applications by BD: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to retrieve job applications by BD',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class JobApplicationStatsView(APIView):
    """
    Get statistics about job applications
    """
    def get(self, request):
        try:
            total_jobs = JobApplication.objects.count()
            
            # Status distribution
            status_stats = {}
            for status_choice in JobApplication.APPLICATION_STATUS_CHOICES:
                status = status_choice[0]
                count = JobApplication.objects.filter(application_status=status).count()
                status_stats[status] = count
            
            # Platform distribution
            platform_stats = {}
            for platform_choice in JobApplication.PLATFORM_CHOICES:
                platform = platform_choice[0]
                count = JobApplication.objects.filter(platform=platform).count()
                platform_stats[platform] = count
            
            # Job type distribution
            job_type_stats = {}
            for job_type_choice in JobApplication.JOB_TYPE_CHOICES:
                job_type = job_type_choice[0]
                count = JobApplication.objects.filter(job_type=job_type).count()
                job_type_stats[job_type] = count
            
            return Response({
                'success': True,
                'stats': {
                    'total_jobs': total_jobs,
                    'status_distribution': status_stats,
                    'platform_distribution': platform_stats,
                    'job_type_distribution': job_type_stats
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error retrieving job application stats: {str(e)}")
            return Response({
                'success': False,
                'error': 'Failed to retrieve statistics',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET', 'POST'])
def interview_schedule_list_create(request):
    """
    GET: List all interview schedules
    POST: Create a new interview schedule
    """
    if request.method == 'GET':
        interview_schedules = InterviewSchedule.objects.all().order_by('-created_at')
        serializer = InterviewScheduleSerializer(interview_schedules, many=True)
        return Response({
            'success': True,
            'count': len(interview_schedules),
            'interview_schedules': serializer.data
        })
    
    elif request.method == 'POST':
        serializer = InterviewScheduleSerializer(data=request.data)
        if serializer.is_valid():
            interview_schedule = serializer.save()
            return Response({
                'success': True,
                'message': 'Interview schedule created successfully',
                'interview_schedule': InterviewScheduleSerializer(interview_schedule).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Failed to create interview schedule',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def interview_schedule_detail(request, interview_id):
    """
    GET: Get specific interview schedule
    PUT: Update interview schedule
    DELETE: Delete interview schedule
    """
    interview_schedule = get_object_or_404(InterviewSchedule, interview_id=interview_id)
    
    if request.method == 'GET':
        serializer = InterviewScheduleSerializer(interview_schedule)
        return Response({
            'success': True,
            'interview_schedule': serializer.data
        })
    
    elif request.method == 'PUT':
        serializer = InterviewScheduleSerializer(interview_schedule, data=request.data)
        if serializer.is_valid():
            updated_interview_schedule = serializer.save()
            return Response({
                'success': True,
                'message': 'Interview schedule updated successfully',
                'interview_schedule': InterviewScheduleSerializer(updated_interview_schedule).data
            })
        
        return Response({
            'success': False,
            'message': 'Failed to update interview schedule',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        company_name = interview_schedule.company_name
        interview_schedule.delete()
        return Response({
            'success': True,
            'message': f'Interview schedule with {company_name} deleted successfully'
        })


@api_view(['GET'])
def interview_schedules_by_developer(request, dev_id):
    """
    Get all interview schedules for a specific developer
    """
    interview_schedules = InterviewSchedule.objects.filter(dev_id__office_id=dev_id).order_by('-interview_date')
    serializer = InterviewScheduleSerializer(interview_schedules, many=True)
    
    return Response({
        'success': True,
        'developer_id': dev_id,
        'count': len(interview_schedules),
        'interview_schedules': serializer.data
    })


@api_view(['GET'])
def interview_schedules_by_bd(request, bd_id):
    """
    Get all interview schedules managed by a specific BD
    """
    interview_schedules = InterviewSchedule.objects.filter(bd_id__BD_id=bd_id).order_by('-interview_date')
    serializer = InterviewScheduleSerializer(interview_schedules, many=True)
    
    return Response({
        'success': True,
        'bd_id': bd_id,
        'count': len(interview_schedules),
        'interview_schedules': serializer.data
    })


@api_view(['GET'])
def get_developer_by_email(request, email):
    """
    Get developer information by email
    """
    try:
        developer = get_object_or_404(Developer_data, email=email)
        
        return Response({
            'success': True,
            'developer': {
                'office_id': developer.office_id,
                'full_name': developer.full_name,
                'firstName': developer.firstName,
                'lastName': developer.lastName,
                'email': developer.email,
                'phone': developer.phone,
                'location': developer.location,
                'professionalTitle': developer.professionalTitle,
                'experience': developer.experience,
                'availability': developer.availability
            }
        })
    except Developer_data.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Developer not found with this email'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'An error occurred while fetching developer data',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
