variable "environment" {
  description = "Environment name"
  type        = string
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