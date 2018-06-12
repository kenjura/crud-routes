module.exports = function(sequelize, DataTypes) {
  const user = sequelize.define('user', {
    userId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'USER_ID'
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
      field: 'USERNAME'
    },
    password: {
      type: DataTypes.STRING(2000),
      allowNull: false,
      field: 'PASSWORD'
    },
    firstName: {
      type: DataTypes.STRING(45),
      allowNull: false,
      field: 'FIRST_NAME'
    },
    lastName: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'LAST_NAME'
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'FULL_NAME'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'EMAIL'
    },
    managerId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'MANAGER_ID'
    },
    roleId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'ROLE_ID'
    },
    createTime: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'CREATE_TIME'
    },
    authToken: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      field: 'AUTH_TOKEN'
    },
    lastUpdateDate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      field: 'LAST_UPDATE_DATE'
    },
    isNew: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0',
      field: 'IS_NEW'
    },
    count: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: '0',
      field: 'COUNT'
    },
    cmsToken: {
      type: DataTypes.STRING(2000),
      allowNull: true,
      field: 'CMS_TOKEN'
    },
    isAdmin: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      defaultValue: '0',
      field: 'IS_ADMIN'
    },
    commodityManagerDimensionId: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'COMMODITY_MANAGER_DIMENSION_ID'
    },
    timezone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'PST',
      field: 'TIMEZONE'
    }
  }, {
    tableName: 'users',
    timestamps: false,
  });
  return user;
};
