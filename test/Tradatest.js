const ICETEA = artifacts.require("ICETEA");
const truffleAssert = require('truffle-assertions');
require('dotenv').config();


contract("ICETEA Test Cases", async ([account_owner, account_one, account_two, account_three]) => {

  const TOKEN_NAME = process.env.TOKEN_NAME;
  const TOKEN_SYMBOL = process.env.TOKEN_SYMBOL;
  const TOTAL_SUPPLY = process.env.TOTAL_SUPPLY;

  const AMOUNT = 200;

  before(async () => {
    token = await ICETEA.new(process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL, process.env.TOTAL_SUPPLY);

  });

  // beforeEach(async () => {
  //   // token = await ICETEA.new(process.env.TOKEN_NAME, process.env.TOKEN_SYMBOL, process.env.TOTAL_SUPPLY);
  //   token = await ICETEA.deployed();

  // });

  async function get_balanceOf(account){
    const balance = await token.balanceOf(account);
    return balance.toNumber();
  }

  // ========================================
  it("Token deployment", async () => {
    const tokenName = await token.name();
    const tokenSymbol = await token.symbol();
    const totalSupply = await token.totalSupply();

    assert.equal(tokenName, TOKEN_NAME);
    assert.equal(tokenSymbol, TOKEN_SYMBOL);
    assert.equal(totalSupply, TOTAL_SUPPLY);
  });


  // ========================================
  it("Get balance of account", async () => {

    const balanceOfAccount_0 = await get_balanceOf(account_owner);
    const balanceOfAccount_1 = await get_balanceOf(account_one);
    const balanceOfAccount_2 = await get_balanceOf(account_two);

    assert.equal(balanceOfAccount_0, TOTAL_SUPPLY);
    assert.equal(balanceOfAccount_1.valueOf(), 0);
    assert.equal(balanceOfAccount_2.valueOf(), 0);
  });


  // =========================================
  it("Transfer token from a account to other account", async () => {

    const balanceOfAccount_0_before = await get_balanceOf(account_owner);
    const balanceOfAccount_1_before = await get_balanceOf(account_one);

    // Transfer token from owner to account[1]
    await token.transfer(account_one, AMOUNT, { from: account_owner });

    const balanceOfAccount_0_after = await get_balanceOf(account_owner);
    const balanceOfAccount_1_after = await get_balanceOf(account_one);

    assert.equal(
      balanceOfAccount_0_before,
      balanceOfAccount_0_after + AMOUNT,
    );

    assert.equal(
      balanceOfAccount_1_before,
      balanceOfAccount_1_after - AMOUNT,
    );
  });

  
  // ======================================
  it("Test pause function by owner", async () => {
    let pause_state_before = await token.paused();
    assert.equal(pause_state_before, false);

    await token.pause({ from: account_owner })
    pause_state_after = await token.paused();

    assert.equal(pause_state_after, true);
  });

  // ======================================
  it("Test unpause function by owner", async () => {

    let pause_state_before = await token.paused();
    assert.equal(pause_state_before, true);

    await token.unpause({ from: account_owner})
    pause_state_after = await token.paused();

    assert.equal(pause_state_after, false);
  });

  // =========================================
  it("Test pause/unpause function from other", async () => {
    let pause_state_before = await token.paused();

    await truffleAssert.reverts(token.pause({ from: account_two }), "OnlyOperator");
    pause_state_after = await token.paused();

    assert.equal(pause_state_after, pause_state_before);
  });

  // =========================================
  it("Test transfer when paused", async () => {
    const balanceOfAccount_0_before = await get_balanceOf(account_owner);
    const balanceOfAccount_1_before = await get_balanceOf(account_one);

    await token.pause({ from: account_owner});

    await truffleAssert.reverts(token.transfer(account_one, AMOUNT, { from: account_owner}), "Paused: token transfer while paused");

    const balanceOfAccount_0_after = await get_balanceOf(account_owner);
    const balanceOfAccount_1_after = await get_balanceOf(account_one);

    assert.equal(balanceOfAccount_0_before, balanceOfAccount_0_after);
    assert.equal(balanceOfAccount_1_before, balanceOfAccount_1_after);

    await token.unpause({ from: account_owner})
  });

  // ==========================================
  it("Change owner permision from owner", async () => {

    await token.setOwner(account_one, { from: account_owner });
    
    const admin = await token.owner();

    assert.equal(admin, account_one);
  });

  // =========================================
  it("Change owner permision from other", async () => {

    await truffleAssert.reverts(token.setOwner(account_owner, { from: account_two }), "OnlyAdmin");

    let admin = await token.owner();
    assert.equal(admin, account_one);

    await token.setOwner(account_owner, { from: account_one});

  });

  // ====================================
  it("Add operator from admin", async () => {

    await token.addOperator(account_one, { from: account_owner});
    
    const role_operator = await token.hasRole(account_one);
    assert.equal(role_operator, true);
  });

  // ====================================
  it("Remove operator from admin", async () => {
    await token.removeOperator(account_one, { from: account_owner});

    const role_operator = await token.hasRole(account_two);
    
    assert.equal(role_operator, false);
  });

  // ===================================
  it("Remove/Add operator from other", async () => {

    await truffleAssert.reverts(token.addOperator(account_two, { from: account_two }), "OnlyAdmin");
    
    const role_operator = await token.hasRole(account_two);
    
    assert.equal(role_operator, false);
  });


  // =====================================
  it("Burn when have balance greater than amount", async () => {
    const balanceOfAccountBefore = await get_balanceOf(account_owner);
    
    await token.burn(AMOUNT, { from: account_owner});

    const balanceOfAccountAfter = await get_balanceOf(account_owner);
    
    assert.equal(balanceOfAccountAfter, balanceOfAccountBefore - AMOUNT);
  });

  // ===================================
  it("Burn when have balance less than amount", async () => {
    const balanceOfAccountBefore = await get_balanceOf(account_three);
    await truffleAssert.reverts(token.burn(AMOUNT, { from: account_three}), "ERC20: burn amount exceeds balance");

    const balanceOfAccountAfter = await get_balanceOf(account_three);
    assert.equal(balanceOfAccountAfter, balanceOfAccountBefore);
  });

  //========================================
  it("mint by owner", async () => {
    const balanceOfAccountBefore = await get_balanceOf(account_owner);
    await token.mintToken(AMOUNT, { from: account_owner});

    const balanceOfAccountAfter = await get_balanceOf(account_owner);

    assert.equal(balanceOfAccountAfter, balanceOfAccountBefore + AMOUNT);
  });

  //=========================
  it("mint by other", async () => {
    const balanceOfAccountBefore = await get_balanceOf(account_three);
    await truffleAssert.reverts(token.mintToken(AMOUNT, { from: account_three}), "OnlyAdmin");

    balance = await token.balanceOf(account_three);
    const balanceOfAccountAfter = balance.toNumber();
    assert.equal(balanceOfAccountAfter, balanceOfAccountBefore);
  });

});

