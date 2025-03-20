### [G-3] Unnecessary constructor call to interface

**Description:**
The Pair contract constructor includes a call to the IPair interface constructor, which is unnecessary:

```solidity
constructor(address _token0, address _token1) ERC20("AgentDEX LP", "LP") IPair() {
    token0 = _token0;
    token1 = _token1;
}
```

Interfaces don't have constructors in Solidity, so the `IPair()` call has no effect and wastes gas.

**Impact:**
This doesn't cause a functional issue, but it:

- Wastes a small amount of gas during contract deployment
- Creates potential confusion for developers reviewing the code
- Indicates a misunderstanding about how interfaces work in Solidity

**Recommended Mitigation:**
Remove the unnecessary interface constructor call:

```solidity
constructor(address _token0, address _token1) ERC20("AgentDEX LP", "LP") {
    token0 = _token0;
    token1 = _token1;
}
```

This change simplifies the code without changing any functionality.
