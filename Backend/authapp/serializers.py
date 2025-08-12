from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Admin, Developer, Client
from django.utils import timezone

ROLE_MODEL_MAP = {
    'admin': Admin,
    'developer': Developer,
    'client': Client,
}

def get_tokens_for_user(user, role):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = role
    refresh['email'] = user.email
    refresh['full_name'] = user.full_name
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


# -------- Register Serializer --------
class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()

    def validate_role(self, value):
        if value not in ROLE_MODEL_MAP:
            raise serializers.ValidationError("Invalid role")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')
        Model = ROLE_MODEL_MAP[role]

        if Model.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({'email': 'User already exists'})

        validated_data['full_name'] = validated_data.pop('username')
        validated_data['password'] = make_password(validated_data['password'])
        return Model.objects.create(**validated_data)


# -------- Login Serializer --------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.CharField()

    def validate(self, data):
        role = data.get('role')
        email = data.get('email')
        password = data.get('password')

        if role not in ROLE_MODEL_MAP:
            raise serializers.ValidationError({'role': 'Invalid role'})

        Model = ROLE_MODEL_MAP[role]

        try:
            user = Model.objects.get(email=email)
        except Model.DoesNotExist:
            raise serializers.ValidationError({'email': 'Invalid email or role'})

        if not check_password(password, user.password):
            raise serializers.ValidationError({'password': 'Invalid password'})

        data['user'] = user
        return data

    def create(self, validated_data):
        user = validated_data['user']
        role = validated_data['role']
        tokens = get_tokens_for_user(user, role)
        return {
            'success': True,
            'message': 'Login successful',
            'user': {
                'full_name': user.full_name,
                'email': user.email,
                'role': role
            },
            'tokens': tokens
        }


# -------- Client Serializer --------
class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_email(self, value):
        """
        Check if email already exists
        """
        # Get the current instance if updating
        instance = getattr(self, 'instance', None)
        
        # Check for existing email
        queryset = Client.objects.filter(email=value)
        
        # If updating, exclude the current instance
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("A client with this email already exists.")
        
        return value

    def validate_client_id(self, value):
        """
        Check if client_id already exists (only for creation)
        """
        # Only validate uniqueness during creation
        if not self.instance and Client.objects.filter(client_id=value).exists():
            raise serializers.ValidationError("A client with this ID already exists.")
        return value

    def validate_hourly_rate(self, value):
        """
        Validate hourly rate is positive
        """
        if value < 0:
            raise serializers.ValidationError("Hourly rate cannot be negative.")
        if value > 10000:  # Add reasonable upper limit
            raise serializers.ValidationError("Hourly rate seems too high. Please verify.")
        return value

    def validate_project_deadline(self, value):
        """
        Validate project deadline is not in the past (only for new projects)
        """
        if not self.instance and value < timezone.now().date():
            raise serializers.ValidationError("Project deadline cannot be in the past.")
        return value

    def validate_client_name(self, value):
        """
        Validate client name
        """
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Client name must be at least 2 characters long.")
        return value.strip()

    def validate_company_name(self, value):
        """
        Validate company name
        """
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Company name must be at least 2 characters long.")
        return value.strip()

    def validate_project_name(self, value):
        """
        Validate project name
        """
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Project name must be at least 3 characters long.")
        return value.strip()

    def to_representation(self, instance):
        """
        Customize the output representation
        """
        representation = super().to_representation(instance)
        
        # Add computed fields if needed
        if hasattr(instance, 'created_at'):
            representation['created_at'] = instance.created_at.isoformat() if instance.created_at else None
        if hasattr(instance, 'updated_at'):
            representation['updated_at'] = instance.updated_at.isoformat() if instance.updated_at else None
            
        return representation

    def update(self, instance, validated_data):
        """
        Update and return an existing Client instance, given the validated data.
        """
        # Update all fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Set updated timestamp if your model has it
        if hasattr(instance, 'updated_at'):
            instance.updated_at = timezone.now()
            
        instance.save()
        return instance