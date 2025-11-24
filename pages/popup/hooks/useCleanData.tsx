import { cleanData as cleanDataUtil } from '@extension/shared';

export const useCleanData = () => {
  const cleanData = async () => {
    await cleanDataUtil();
  };
  return { cleanData };
};
