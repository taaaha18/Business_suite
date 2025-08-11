from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Admin, Assistant, Manager, Developer, Designer

ROLE_MODEL_MAP = {
    'admin': Admin,
    'assistant': Assistant,
    'manager': Manager,
    'developer': Developer,
    'designer': Designer,
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
