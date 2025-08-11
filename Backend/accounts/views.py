from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password, check_password
import json
import logging
from django.http import JsonResponse
from .models import Admin, Assistant, Manager, Developer, Designer

# Set up logging
logger = logging.getLogger(__name__)

ROLE_MODEL_MAP = {
    'admin': Admin,
    'assistant': Assistant,
    'manager': Manager,
    'developer': Developer,
    'designer': Designer,
}


def dashboard(request):
    return JsonResponse({'message': 'Admin dashboard working!'})
    
def print_and_log(message):
    print(message)
    logger.info(message)

@csrf_exempt
@require_http_methods(["POST"])
def register_user(request):
    print_and_log("\n📥 [REGISTER] New registration request received.")

    try:
        try:
            data = json.loads(request.body)
            print_and_log(f"🔍 Parsed data: {data}")
        except json.JSONDecodeError:
            print_and_log("❌ Invalid JSON")
            return JsonResponse({'message': 'Invalid JSON'}, status=400)

        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        print_and_log(f"🧾 Provided - Username: {username}, Email: {email}, Role: {role}")

        if not all([username, email, password, role]):
            print_and_log("⚠️ Missing one or more required fields.")
            return JsonResponse({'message': 'All fields are required'}, status=400)

        if role not in ROLE_MODEL_MAP:
            print_and_log(f"❌ Invalid role: {role}")
            return JsonResponse({'message': 'Invalid role'}, status=400)

        Model = ROLE_MODEL_MAP[role]
        table_name = Model._meta.db_table
        print_and_log(f"📦 Target Table: {table_name} | Model: {Model.__name__}")

        if Model.objects.filter(email=email).exists():
            print_and_log(f"⚠️ User with email {email} already exists in {table_name}")
            return JsonResponse({'message': 'User already exists'}, status=400)
        print_and_log("🔥 About to create user in DB...")
        Model.objects.create(
            full_name=username,
            email=email,
            password=make_password(password)
        )

        print_and_log(f"✅ User {email} successfully registered in table `{table_name}`")
        return JsonResponse({'message': 'User registered successfully'}, status=201)

    except Exception as e:
        print_and_log(f"❌ Exception during registration: {str(e)}")
        return JsonResponse({'message': f'Error: {str(e)}'}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def login_user(request):
    print_and_log("\n🔐 [LOGIN] Login attempt received.")

    try:
        print_and_log(f"🌐 Request IP: {request.META.get('REMOTE_ADDR')}")

        try:
            data = json.loads(request.body)
            print_and_log(f"📩 Payload Keys: {list(data.keys())}")
        except json.JSONDecodeError:
            print_and_log("❌ Invalid JSON")
            return JsonResponse({'success': False, 'error': 'Invalid JSON'}, status=400)

        email = data.get('email')
        password = data.get('password')
        role = data.get('role')

        print_and_log(f"🧾 Provided - Email: {email}, Role: {role}")

        if not all([email, password, role]):
            missing_fields = [f for f, v in [('email', email), ('password', password), ('role', role)] if not v]
            print_and_log(f"⚠️ Missing fields: {missing_fields}")
            return JsonResponse({'success': False, 'error': f'Missing fields: {", ".join(missing_fields)}'}, status=400)

        if role not in ROLE_MODEL_MAP:
            print_and_log(f"❌ Invalid role: {role}")
            return JsonResponse({'success': False, 'error': f'Invalid role. Must be one of: {", ".join(ROLE_MODEL_MAP.keys())}'}, status=400)

        role_model = ROLE_MODEL_MAP[role]
        table_name = role_model._meta.db_table
        print_and_log(f"📦 Looking up user in Table: {table_name} | Model: {role_model.__name__}")

        try:
            user = role_model.objects.get(email=email)
            print_and_log(f"✅ User found: {user.full_name} ({user.email})")
        except role_model.DoesNotExist:
            print_and_log(f"❌ No user found with email {email} in table `{table_name}`")
            return JsonResponse({'success': False, 'error': 'Invalid email or role'}, status=401)

        if check_password(password, user.password):
            print_and_log(f"🔓 Login success for user: {email}")
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'full_name': user.full_name,
                    'email': user.email,
                    'role': role
                }
            })
        else:
            print_and_log(f"❌ Password mismatch for user: {email}")
            return JsonResponse({'success': False, 'error': 'Invalid password'}, status=401)

    except Exception as e:
        print_and_log(f"❌ Exception during login: {str(e)}")
        return JsonResponse({'success': False, 'error': f'Server error: {str(e)}'}, status=500)
