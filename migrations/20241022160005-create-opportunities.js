'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('opportunities', {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        defaultValue: 'USD'
      },
      stage: {
        type: Sequelize.STRING,
        allowNull: false
      },
      expected_close_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      contact_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'contacts',
          key: 'id'
        }
      },
      owner_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('opportunities');
  }
};