'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tickets', {
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
      contact_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'contacts',
          key: 'id'
        }
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'sla_policies',
          key: 'priority'
        }
      },
      assigned_to: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      sla_breached: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      response_time: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      resolution_time: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      first_response_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      due_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tickets');
  }
};