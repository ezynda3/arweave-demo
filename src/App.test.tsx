import Arweave from 'arweave';
import { readContract, } from 'smartweave';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
  logging: false,
});

const contractId = 'AyMOrdUyiI85EH2fJaaHuFonm5kNjFseEmYQzxgPjq8';

describe('Todo contract', () => {
  test('can read contract', async () => {
      const result = await readContract(arweave, contractId);
      expect(result.todos).toBeDefined();
  });
});
