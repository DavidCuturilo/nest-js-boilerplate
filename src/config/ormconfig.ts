const SnakeNamingStrategy =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('typeorm-naming-strategies').SnakeNamingStrategy;

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

export default {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: process.env.PG_PORT as unknown as number,
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  migrationsTableName: 'migration',
  migrations: ['src/migration/*.ts'],
  cli: {
    migrationsDir: 'src/migration',
  },
  ssl: false,
  namingStrategy: new SnakeNamingStrategy(),
  logging: eval(process.env.ORM_LOGGING) || eval(process.env.orm_logging),
  synchronize:
    'true' === process.env.orm_synchronize?.toLocaleLowerCase() ||
    'true' === process.env.ORM_SYNCHRONIZE?.toLocaleLowerCase(),
  migrationsRun: true,
};
