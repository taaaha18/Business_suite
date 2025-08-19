# admin.py
from django.contrib import admin
from .models import Admin, Developer, Client, Developer_data


@admin.register(Admin)
class AdminModelAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name')
    search_fields = ('email', 'full_name')


@admin.register(Developer)
class DeveloperModelAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name')
    search_fields = ('email', 'full_name')


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('client_id', 'client_name', 'company_name', 'email', 'project_name', 'project_deadline')
    list_filter = ('project_deadline', 'hourly_rate')
    search_fields = ('client_name', 'company_name', 'email', 'project_name')
    ordering = ('-client_id',)


@admin.register(Developer_data)
class DeveloperDataAdmin(admin.ModelAdmin):
    list_display = ('office_id', 'firstName', 'lastName', 'email', 'professionalTitle', 'experience', 'availability', 'created_at')
    list_filter = ('experience', 'availability', 'created_at', 'graduationYear')
    search_fields = ('office_id', 'firstName', 'lastName', 'email', 'professionalTitle', 'location')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('office_id', 'firstName', 'lastName', 'email', 'phone', 'location')
        }),
        ('Professional Details', {
            'fields': ('professionalTitle', 'experience', 'Salary', 'availability')
        }),
        ('Education', {
            'fields': ('degree', 'university', 'graduationYear')
        }),
        ('Skills & Languages', {
            'fields': ('technicalSkills', 'languages')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )