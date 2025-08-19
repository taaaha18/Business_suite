# views.py - Corrected BD Management Views
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from .models import Admin, Developer, Client, Developer_data, BD
import logging
from .serializers import RegisterSerializer, LoginSerializer, ClientSerializer, DeveloperDataSerializer, BDSerializer

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