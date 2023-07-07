import { DataSource, DataSourceOptions } from 'typeorm';
import ormconfig from './ormconfig';

const MainDataSource = new DataSource({
  ...(ormconfig as DataSourceOptions),
});

export default MainDataSource;
