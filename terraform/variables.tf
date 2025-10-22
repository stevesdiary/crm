variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "crm_db"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "crm_user"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "b2_application_key_id" {
  description = "Backblaze B2 Application Key ID"
  type        = string
  sensitive   = true
}

variable "b2_application_key" {
  description = "Backblaze B2 Application Key"
  type        = string
  sensitive   = true
}

variable "b2_region" {
  description = "Backblaze B2 region"
  type        = string
  default     = "us-west-004"
}