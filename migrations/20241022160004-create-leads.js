'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('leads', {
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
        allowNull: true,
        references: {
          model: 'contacts',
          key: 'id'
        }
      },
      source: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: true
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
    await queryInterface.dropTable('leads');
  }
};