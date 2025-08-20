from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Admin, Developer, Client, Developer_data, BD,JobApplication,InterviewSchedule
from django.utils import timezone
import re

ROLE_MODEL_MAP = {
    'admin': Admin,
    'developer': Developer,
    'client': Client,
    'bd': BD,  # Added BD to role model mapping
}

def get_tokens_for_user(user, role):
    refresh = RefreshToken.for_user(user)
    refresh['role'] = role
    refresh['email'] = user.email
    if hasattr(user, 'full_name'):
        refresh['full_name'] = user.full_name
    else:
        refresh['full_name'] = user.name  # For BD model
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

        # Handle BD model differently as it uses 'name' instead of 'full_name'
        if role == 'bd':
            validated_data['name'] = validated_data.pop('username')
        else:
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
        
        # Get user's name based on model structure
        user_name = user.full_name if hasattr(user, 'full_name') else user.name
        
        return {
            'success': True,
            'message': 'Login successful',
            'user': {
                'full_name': user_name,
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
# Update your BDSerializer in serializers.py
# Updated BDSerializer in serializers.py
class BDSerializer(serializers.ModelSerializer):
    class Meta:
        model = BD
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_BD_id(self, value):
        """
        Check if BD_id already exists (only for creation)
        """
        # Only validate uniqueness during creation
        if not self.instance and BD.objects.filter(BD_id=value).exists():
            raise serializers.ValidationError("A BD with this ID already exists.")
        return value.strip() if value else value

    def validate_email(self, value):
        """
        Check if email already exists and is valid
        """
        if not value:
            raise serializers.ValidationError("Email is required.")
            
        # Get the current instance if updating
        instance = getattr(self, 'instance', None)
        
        # Check for existing email
        queryset = BD.objects.filter(email=value)
        
        # If updating, exclude the current instance
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("A BD with this email already exists.")
        
        return value

    def validate_phone(self, value):
        """
        Validate phone number format - allow N/A
        """
        if not value:
            return "N/A"  # Default value if not provided
            
        if value == "N/A":
            return value
            
        # Basic phone validation - you can make this more strict if needed
        cleaned_phone = value.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not re.match(r'^\+?1?\d{9,15}$', cleaned_phone):
            raise serializers.ValidationError("Invalid phone number format.")
        return value

    def validate_name(self, value):
        """
        Validate name
        """
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long.")
        return value.strip()

    def validate_password(self, value):
        """
        Validate password
        """
        if not value or len(value.strip()) < 1:
            raise serializers.ValidationError("Password is required.")
        return value

    def validate_salary(self, value):
        """
        Validate salary field - allow string values and numbers
        """
        if not value:
            raise serializers.ValidationError("Salary information is required.")
        
        # Convert to string if it's a number
        if isinstance(value, (int, float)):
            return str(value)
        
        # If it's already a string, just strip and validate
        salary_str = str(value).strip()
        if not salary_str:
            raise serializers.ValidationError("Salary information is required.")
            
        return salary_str

    def validate_education(self, value):
        """
        Validate education field - allow N/A
        """
        if not value:
            return "N/A"
            
        if value == "N/A":
            return value
            
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Education information must be at least 2 characters long.")
        return value.strip()

    def validate_location(self, value):
        """
        Validate location field - allow N/A
        """
        if not value:
            return "N/A"
            
        if value == "N/A":
            return value
            
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Location must be at least 2 characters long.")
        return value.strip()

    def validate_experience(self, value):
        """
        Validate experience field
        """
        if not value:
            return "0-1 years"  # Default value
            
        # Check if the value is in the allowed choices
        valid_choices = [choice[0] for choice in BD.EXPERIENCE_CHOICES]
        if value not in valid_choices:
            return "0-1 years"  # Default to first choice if invalid
            
        return value

    def validate_availability(self, value):
        """
        Validate availability field
        """
        if not value:
            return "Full-time"  # Default value
            
        # Check if the value is in the allowed choices
        valid_choices = [choice[0] for choice in BD.AVAILABILITY_CHOICES]
        if value not in valid_choices:
            return "Full-time"  # Default to first choice if invalid
            
        return value

    def create(self, validated_data):
        """
        Create a new BD instance with hashed password
        """
        try:
            # Hash the password before saving
            if 'password' in validated_data:
                validated_data['password'] = make_password(validated_data['password'])
            
            # Set default values for required fields if not provided
            if 'phone' not in validated_data:
                validated_data['phone'] = "N/A"
            if 'location' not in validated_data:
                validated_data['location'] = "N/A"
            if 'education' not in validated_data:
                validated_data['education'] = "N/A"
            if 'experience' not in validated_data:
                validated_data['experience'] = "0-1 years"
            if 'availability' not in validated_data:
                validated_data['availability'] = "Full-time"
                
            return super().create(validated_data)
        except Exception as e:
            print(f"Error creating BD: {str(e)}")  # For debugging
            raise serializers.ValidationError(f"Error creating BD: {str(e)}")

    def update(self, instance, validated_data):
        """
        Update an existing BD instance
        """
        try:
            # Hash password if it's being updated
            if 'password' in validated_data:
                validated_data['password'] = make_password(validated_data['password'])
            
            # Update all fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Set updated timestamp
            instance.updated_at = timezone.now()
            instance.save()
            return instance
        except Exception as e:
            print(f"Error updating BD: {str(e)}")  # For debugging
            raise serializers.ValidationError(f"Error updating BD: {str(e)}")

    def to_representation(self, instance):
        """
        Customize the output representation
        """
        representation = super().to_representation(instance)
        
        # Add computed fields
        representation['full_name'] = instance.full_name
        
        # Format timestamps
        if instance.created_at:
            representation['created_at'] = instance.created_at.isoformat()
        if instance.updated_at:
            representation['updated_at'] = instance.updated_at.isoformat()
        
        # Remove password from output for security
        representation.pop('password', None)
            
        return representation

# -------- Developer Data Serializer --------
class DeveloperDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = Developer_data
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

    def validate_office_id(self, value):
        """
        Check if office_id already exists (only for creation)
        """
        # Only validate uniqueness during creation
        if not self.instance and Developer_data.objects.filter(office_id=value).exists():
            raise serializers.ValidationError("A developer with this Office ID already exists.")
        return value.strip()

    def validate_email(self, value):
        """
        Check if email already exists and is valid
        """
        # Get the current instance if updating
        instance = getattr(self, 'instance', None)
        
        # Check for existing email
        queryset = Developer_data.objects.filter(email=value)
        
        # If updating, exclude the current instance
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError("A developer with this email already exists.")
        
        return value

    def validate_phone(self, value):
        """
        Validate phone number format
        """
        if value and not re.match(r'^\+?1?\d{9,15}$', value.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')):
            raise serializers.ValidationError("Invalid phone number format.")
        return value

    def validate_firstName(self, value):
        """
        Validate first name
        """
        if len(value.strip()) < 2:
            raise serializers.ValidationError("First name must be at least 2 characters long.")
        return value.strip()

    def validate_lastName(self, value):
        """
        Validate last name
        """
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Last name must be at least 2 characters long.")
        return value.strip()

    def validate_graduationYear(self, value):
        """
        Validate graduation year
        """
        if value:
            try:
                year = int(value)
                current_year = timezone.now().year
                if year < 1950 or year > current_year + 10:
                    raise serializers.ValidationError("Please enter a valid graduation year.")
            except ValueError:
                raise serializers.ValidationError("Graduation year must be a valid number.")
        return value

    def validate_technicalSkills(self, value):
        """
        Validate technical skills list
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Technical skills must be a list.")
        
        # Remove empty strings and duplicates
        cleaned_skills = list(set([skill.strip() for skill in value if skill.strip()]))
        return cleaned_skills

    def validate_languages(self, value):
        """
        Validate languages list
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Languages must be a list.")
        
        # Remove empty strings and duplicates
        cleaned_languages = list(set([lang.strip() for lang in value if lang.strip()]))
        return cleaned_languages

    def validate_Salary(self, value):
        """
        Validate salary field
        """
        if value and len(value.strip()) < 1:
            raise serializers.ValidationError("Salary information is required.")
        return value

    def to_representation(self, instance):
        """
        Customize the output representation
        """
        representation = super().to_representation(instance)
        
        # Add computed fields
        representation['full_name'] = instance.full_name
        representation['created_at'] = instance.created_at.isoformat() if instance.created_at else None
        representation['updated_at'] = instance.updated_at.isoformat() if instance.updated_at else None
            
        return representation

    def update(self, instance, validated_data):
        """
        Update and return an existing Developer_data instance, given the validated data.
        """
        # Update all fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Set updated timestamp
        instance.updated_at = timezone.now()
        instance.save()
        return instance

    ####Job Title Validation######

   # Add this JobApplicationSerializer to your existing serializers.py file
# Add this import at the top: from .models import JobApplication

class JobApplicationSerializer(serializers.ModelSerializer):
    # Add read-only fields for better data representation
    bd_name = serializers.CharField(source='bd_id.name', read_only=True)
    skills_display = serializers.CharField(source='skills_list', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ('job_id', 'created_at', 'updated_at', 'applied_date')

    def validate_bd_id(self, value):
        """
        Validate that the BD exists
        """
        if not BD.objects.filter(BD_id=value.BD_id).exists():
            raise serializers.ValidationError("Invalid BD ID. BD does not exist.")
        return value

    def validate_job_title(self, value):
        """
        Validate job title
        """
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Job title must be at least 2 characters long.")
        return value.strip()

    def validate_company(self, value):
        """
        Validate company name
        """
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Company name must be at least 2 characters long.")
        return value.strip()

    def validate_platform(self, value):
        """
        Validate platform
        """
        if not value:
            raise serializers.ValidationError("Platform is required.")
        
        valid_platforms = [choice[0] for choice in JobApplication.PLATFORM_CHOICES]
        if value not in valid_platforms:
            raise serializers.ValidationError(f"Invalid platform. Must be one of: {', '.join(valid_platforms)}")
        return value

    def validate_job_url(self, value):
        """
        Validate job URL if provided
        """
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("Job URL must start with http:// or https://")
        return value

    def validate_skills(self, value):
        """
        Validate skills list
        """
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills must be a list.")
        
        # Remove empty strings and duplicates
        cleaned_skills = list(set([skill.strip() for skill in value if skill and skill.strip()]))
        return cleaned_skills

    def validate_salary_range(self, value):
        """
        Validate salary range format
        """
        if value and len(value.strip()) < 3:
            raise serializers.ValidationError("Please provide a valid salary range.")
        return value.strip() if value else None

    def validate_job_type(self, value):
        """
        Validate job type
        """
        if value:
            valid_job_types = [choice[0] for choice in JobApplication.JOB_TYPE_CHOICES]
            if value not in valid_job_types:
                raise serializers.ValidationError(f"Invalid job type. Must be one of: {', '.join(valid_job_types)}")
        return value

    def validate_experience_level(self, value):
        """
        Validate experience level
        """
        if value:
            valid_experience_levels = [choice[0] for choice in JobApplication.EXPERIENCE_LEVEL_CHOICES]
            if value not in valid_experience_levels:
                raise serializers.ValidationError(f"Invalid experience level. Must be one of: {', '.join(valid_experience_levels)}")
        return value

    def validate_application_status(self, value):
        """
        Validate application status
        """
        if value:
            valid_statuses = [choice[0] for choice in JobApplication.APPLICATION_STATUS_CHOICES]
            if value not in valid_statuses:
                raise serializers.ValidationError(f"Invalid application status. Must be one of: {', '.join(valid_statuses)}")
        return value

    def to_representation(self, instance):
        """
        Customize the output representation
        """
        representation = super().to_representation(instance)
        
        # Add formatted timestamps
        if instance.created_at:
            representation['created_at'] = instance.created_at.isoformat()
        if instance.updated_at:
            representation['updated_at'] = instance.updated_at.isoformat()
        if instance.applied_date:
            representation['applied_date'] = instance.applied_date.isoformat()
            
        # Add BD information
        representation['bd_info'] = {
            'bd_id': instance.bd_id.BD_id,
            'name': instance.bd_id.name,
            'email': instance.bd_id.email
        }
        
        return representation

    def create(self, validated_data):
        """
        Create a new job application
        """
        try:
            return super().create(validated_data)
        except Exception as e:
            raise serializers.ValidationError(f"Error creating job application: {str(e)}")

    def update(self, instance, validated_data):
        """
        Update an existing job application
        """
        try:
            # Update all fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Set updated timestamp
            instance.updated_at = timezone.now()
            instance.save()
            return instance
        except Exception as e:
            raise serializers.ValidationError(f"Error updating job application: {str(e)}")


# Optional: Create a simplified serializer for listing jobs
class JobApplicationListSerializer(serializers.ModelSerializer):
    bd_name = serializers.CharField(source='bd_id.name', read_only=True)
    skills_display = serializers.CharField(source='skills_list', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = [
            'job_id', 'job_title', 'company', 'location', 'salary_range',
            'job_type', 'experience_level', 'platform', 'job_url', 'skills',
            'job_description', 'key_requirements', 'personal_notes', 
            'application_status', 'bd_name', 'skills_display', 'applied_date', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ('job_id', 'created_at', 'updated_at', 'applied_date')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Add BD information
        representation['bd_info'] = {
            'bd_id': instance.bd_id.BD_id,
            'name': instance.bd_id.name,
            'email': instance.bd_id.email
        }
        
        # Ensure skills is always an array
        if isinstance(instance.skills, str):
            representation['skills'] = [instance.skills] if instance.skills else []
        elif isinstance(instance.skills, list):
            representation['skills'] = instance.skills
        else:
            representation['skills'] = []
            
        # Format timestamps
        if instance.created_at:
            representation['created_at'] = instance.created_at.isoformat()
        if instance.updated_at:
            representation['updated_at'] = instance.updated_at.isoformat()
        if instance.applied_date:
            representation['applied_date'] = instance.applied_date.isoformat()
            
        return representation

class InterviewScheduleSerializer(serializers.ModelSerializer):
    # Read-only fields for displaying related data
    bd_name = serializers.CharField(source='bd_id.name', read_only=True)
    developer_name = serializers.CharField(source='dev_id.full_name', read_only=True)
    
    class Meta:
        model = InterviewSchedule
        fields = '__all__'
        read_only_fields = ('interview_id', 'created_at', 'updated_at')
    
    def validate_company_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Company name must be at least 2 characters long.")
        return value.strip()
    
    def validate_role(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Role must be at least 2 characters long.")
        return value.strip()
    
    def validate_company_url(self, value):
        if value and not value.startswith(('http://', 'https://')):
            value = f'https://{value}'
        return value
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Add BD information
        representation['bd_info'] = {
            'bd_id': instance.bd_id.BD_id,
            'name': instance.bd_id.name,
            'email': instance.bd_id.email
        }
        
        # Add Developer information
        representation['developer_info'] = {
            'office_id': instance.dev_id.office_id,
            'name': instance.dev_id.full_name,
            'email': instance.dev_id.email,
            'title': instance.dev_id.professionalTitle
        }
        
        return representation