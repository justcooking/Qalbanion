import { useCollectionsContext } from '../contexts/CollectionsContext';

export const useCollections = () => {
  return useCollectionsContext();
};
