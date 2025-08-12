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
