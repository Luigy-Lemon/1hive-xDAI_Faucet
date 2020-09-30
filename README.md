# xDAI-ETH faucet server

built upon: https://github.com/sponnet/locals-faucetserver

supports xDAI and test-erc20 token transfers to (pay out amount `1` xdai and `2` test erc20 tokens),  ropsten and eth-mainnet

- payout frequency: 120 seconds
- server check frequency: 10 seconds

(configured in `server/config.json`)

address and ip are 'greylisted' right after a successful transaction - for 60 seconds. greylists are reset every 10 seconds.

![screenshot](screen.png)

# installing

```
$ git clone https://github.com/Luigy-Lemon/1hive-xDAI_Faucet.git xDAI-faucet
$ cd xDAI-faucet && cd server && npm install
$ cd .. && cd client && npm install
$ cd ..
```

## Configuring the faucet API

edit ```config.json``` in the `server/` directory and add private keys to the accounts for each network.

Start your faucet:

```
node index.js
```

## Configuring the faucet frontend

edit the file `client/src/config.js` and specify the base URL for your API. Run `npm run start`

# API

## Endpoints

### ```GET https://<FAUCET-URL>/info```

#### Response
```
{
	checkfreqinsec: ...,
	greylistdurationinsec: ...,
	balances: [
		{
			"network": ...,
			"account": ...,
			"balanceEth": ...,
			"balanceTestErc20": ...
		},
		...
	]
}
```

### ```GET https://<FAUCET-URL>/tokenInfo```

#### Response 

```
{
	"tokenInfo":[
		{
			"network": ...,
			"payoutEth": ...,
			"payoutTestErc20": ...,
			"testErc20Address": ...
		},
		...
	]
}
```

### ```GET https://<FAUCET-URL>/{network name}/{token}/{ethereum address}```

#### Request parameters

- #### Network Name
|name|RPC|
|---|---|
|`xdai`|`https://blockscout.com/poa/xdai`|


- #### token
|name|token|
|---|---|
|`xdai`|the native coin on these testnets|


- #### ethereum address
your ethereum address


#### Response format
Status code: 200
```
{ 
	hash: 0x2323... 
}
```
Status code: 500
```
{
	err: {
		...
	}
}
```
* `hash` transaction hash 

## Example Usage

`curl http://localhost:1337/ropsten/testErc20/0x96C42C56fdb78294F96B0cFa33c92bed7D75F96a`


## HTTP Return / error codes

* `200` : Request OK
* `400` : Invalid address
* `500` : error (greylisted/ tx error)
