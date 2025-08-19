from django.db import models

class BaseUser(models.Model):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(primary_key=True)
    password = models.CharField(max_length=255)

    class Meta:
        abstract = True


class Admin(BaseUser):
    pass


class Developer(BaseUser):
    pass


class Client(models.Model):
    client_id = models.AutoField(primary_key=True)
    client_name = models.CharField(max_length=100)
    company_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    project_deadline = models.DateField()
    project_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.client_name} - {self.project_name}"


class Developer_data(models.Model):
    EXPERIENCE_CHOICES = [
        ('0-1 years', '0-1 years'),
        ('1-2 years', '1-2 years'),
        ('2-3 years', '2-3 years'),
        ('3-5 years', '3-5 years'),
        ('5+ years', '5+ years'),
        ('10+ years', '10+ years'),
    ]
    
    AVAILABILITY_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Freelance', 'Freelance'),
        ('Unavailable', 'Unavailable'),
    ]

    # Primary key
    office_id = models.CharField(max_length=50, primary_key=True)
    
    # Personal Information
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100)
    professionalTitle = models.CharField(max_length=100)
    
    # Education
    degree = models.CharField(max_length=200)
    university = models.CharField(max_length=200)
    graduationYear = models.CharField(max_length=4)
    
    # Skills and Languages (stored as JSON or comma-separated strings)
    technicalSkills = models.JSONField(default=list, help_text="List of technical skills")
    languages = models.JSONField(default=list, help_text="List of languages")
    
    # Professional Details
    experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES)
    Salary = models.CharField(max_length=100, help_text="Salary information")
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='Full-time')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'developer_data'
        verbose_name = 'Developer Data'
        verbose_name_plural = 'Developer Data'

    def __str__(self):
        return f"{self.firstName} {self.lastName} - {self.office_id}"

    @property
    def full_name(self):
        return f"{self.firstName} {self.lastName}"


class BD(models.Model):
    EXPERIENCE_CHOICES = [
        ('0-1 years', '0-1 years'),
        ('1-2 years', '1-2 years'),
        ('2-3 years', '2-3 years'),
        ('3-5 years', '3-5 years'),
        ('5+ years', '5+ years'),
        ('10+ years', '10+ years'),
    ]
    
    AVAILABILITY_CHOICES = [
        ('Full-time', 'Full-time'),
        ('Part-time', 'Part-time'),
        ('Contract', 'Contract'),
        ('Freelance', 'Freelance'),
        ('Unavailable', 'Unavailable'),
    ]
    
    # Primary key
    BD_id = models.CharField(max_length=50, primary_key=True)
    
    # Basic Information
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    password = models.CharField(max_length=255)
    salary = models.CharField(max_length=100, help_text="Salary information")
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=100)
    
    # Education and Professional Details
    education = models.CharField(max_length=200, help_text="Educational background")
    experience = models.CharField(max_length=20, choices=EXPERIENCE_CHOICES)
    availability = models.CharField(max_length=20, choices=AVAILABILITY_CHOICES, default='Full-time')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bd_data'
        verbose_name = 'Business Development'
        verbose_name_plural = 'Business Development'

    def __str__(self):
        return f"{self.name} - {self.BD_id}"

    @property
    def full_name(self):
        return self.name