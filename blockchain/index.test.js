const Blockhain = require('./index');
const Block = require('./block');

describe('Blockhain', ()=>{
    let bc;
    let bc2;

    beforeEach(()=>{
        bc = new Blockhain();
        bc2 = new Blockhain();
    });

    it ('starts with the genesis block',()=>{
        expect(bc.chain[0]).toEqual(Block.genesis());
    });

    it ('adds a new block', () =>{
        const data = "foo";
        bc.addBlock(data);
        expect(bc.chain[bc.chain.length-1].data).toEqual(data);
    });

    it ('validates a valid chain', ()=>{
        bc2.addBlock('foo');
        expect(bc.isValidChain(bc2.chain)).toBe(true);
    });

    it ('invalidates a chain with a corrupt genesis block',()=>{
        bc2.chain[0].data = "bad data";
        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });

    it('invalidates corrupt chain (not necessarily genesis block)', ()=>{
        bc2.addBlock('foo');
        bc2.chain[1] = "not foo";
        expect(bc.isValidChain(bc2.chain)).toBe(false);
    });
 
    it("replaces the chain with a valid chain", () => {
        bc2.addBlock("goo");
        bc.replaceChain(bc2.chain);
        expect(bc.chain).toEqual(bc2.chain);
    });

    it("does not replace chain of equal to or less than length", () => {
        bc.addBlock("foo");
        bc.replaceChain(bc2.chain);
        expect(bc.chain).not.toEqual(bc2.chain);
    });
});