terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
      configuration_aliases = [aws.b2]
    }
  }
}

provider "aws" {
  alias      = "b2"
  region     = var.b2_region
  access_key = var.b2_application_key_id
  secret_key = var.b2_application_key
  
  endpoints {
    s3 = "https://s3.${var.b2_region}.backblazeb2.com"
  }
  
  skip_credentials_validation = true
  skip_region_validation      = true
  skip_requesting_account_id  = true
}