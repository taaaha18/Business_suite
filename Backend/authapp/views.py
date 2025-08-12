from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from .models import Admin, Developer, Client
import logging
from .serializers import RegisterSerializer, LoginSerializer, ClientSerializer


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
    """
    Handle GET (list all clients) and POST (create new client)
    """
    
    def get(self, request):
        """Get all clients"""
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
        """Create new client"""
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
    """
    Handle GET, PUT, DELETE for individual client
    """
    
    def get_client(self, client_id):
        """Helper method to get client by ID"""
        try:
            return Client.objects.get(client_id=client_id)
        except Client.DoesNotExist:
            return None

    def get(self, request, client_id):
        """Get single client"""
        client = self.get_client(client_id)
        if not client:
            return Response({
                'error': 'Client not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ClientSerializer(client)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, client_id):
        """Update client"""
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
        """Delete client"""
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