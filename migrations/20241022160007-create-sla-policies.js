'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sla_policies', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      tenant_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        }
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      response_time: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      resolution_time: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      business_hours_only: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sla_policies');
  }
};