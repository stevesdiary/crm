// Simple test script for tenant registration with roles
const testTenantRegistration = async () => {
  const testData = {
    tenantName: "Test Company",
    adminFullName: "John Doe",
    adminEmail: "john@testcompany.com",
    adminPassword: "password123",
    domain: "testcompany.com"
  };

  try {
    const response = await fetch('http://localhost:3004/api/v1/tenants/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Tenant registration successful:');
      console.log('  Tenant:', result.tenant.name);
      console.log('  Admin User:', result.user.fullName, '(' + result.user.email + ')');
      console.log('  Default roles created: admin, sales, support');
    } else {
      console.log('❌ Tenant registration failed:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run the test
console.log('🚀 Testing tenant registration with roles...');
testTenantRegistration();