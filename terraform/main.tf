terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source = "./modules/network"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
}

module "rds" {
  source = "./modules/rds"
  
  environment         = var.environment
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
}

module "redis" {
  source = "./modules/redis"
  
  environment        = var.environment
  vpc_id            = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
}

module "s3" {
  source = "./modules/s3"
  
  environment           = var.environment
  b2_application_key_id = var.b2_application_key_id
  b2_application_key    = var.b2_application_key
  b2_region            = var.b2_region
}