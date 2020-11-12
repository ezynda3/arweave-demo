import Arweave from 'arweave';
import { readContract, } from 'smartweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
});

const contractId = '5NgGX4OToJ4M5ohWP4yxaTz_2oPsnk7vmR0v3mqXi_A';

describe('Todo contract', () => {
  test('can read contract', async () => {
      const result = await readContract(arweave, contractId);
      expect(result.todos).toBeDefined();
  });
});
