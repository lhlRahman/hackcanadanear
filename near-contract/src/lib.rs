use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::core::NonFungibleTokenCore;
use near_contract_standards::non_fungible_token::Token;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, PromiseOrValue, BorshStorageKey, log};
use near_sdk::collections::{UnorderedMap, UnorderedSet};

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    TokenMetadata,
    Enumeration,
    Approval,
    PlantMetadata,
    ApprovedAccounts,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct PlantParameter {
    pub score: u8,
    pub explanation: String,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct PlantParameters {
    pub color_vibrancy: PlantParameter,
    pub leaf_area_index: PlantParameter,
    pub wilting: PlantParameter,
    pub spotting: PlantParameter,
    pub symmetry: PlantParameter,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct PlantMetadata {
    pub glb_file_url: String,
    pub parameters: PlantParameters,
    pub name: String,
    pub wallet_id: String,
    pub price: String, // Price as string in yoctoNEAR
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: UnorderedMap<String, PlantMetadata>,
    approved_accounts: UnorderedSet<AccountId>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        let owner_id = env::predecessor_account_id();
        let mut approved_accounts = UnorderedSet::new(StorageKey::ApprovedAccounts);
        // Add approved accounts
        approved_accounts.insert(&"lebronjamesnear.testnet".parse().unwrap());
        approved_accounts.insert(&"lhlrahman.testnet".parse().unwrap());
        approved_accounts.insert(&"hackcanada.testnet".parse().unwrap());

        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id.clone(),
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: UnorderedMap::new(StorageKey::PlantMetadata),
            approved_accounts,
        }
    }

    /// Mint a new NFT (Plant NFT)
    #[payable]
    pub fn nft_mint(
        &mut self,
        token_id: String,
        plant_metadata: PlantMetadata,
        receiver_id: AccountId,
    ) -> Token {
        // Only contract owner can mint in this example.
        assert_eq!(
            env::predecessor_account_id(),
            self.tokens.owner_id,
            "Only contract owner can mint NFTs"
        );
        let token_metadata = TokenMetadata {
            title: Some(plant_metadata.name.clone()),
            description: Some("Plant NFT".to_string()),
            media: Some(plant_metadata.glb_file_url.clone()),
            media_hash: None,
            copies: Some(1),
            issued_at: Some(env::block_timestamp().to_string()),
            expires_at: None,
            starts_at: None,
            updated_at: None,
            extra: None,
            reference: None,
            reference_hash: None,
        };

        self.metadata.insert(&token_id, &plant_metadata);
        self.tokens.internal_mint(token_id, receiver_id, Some(token_metadata))
    }
    
    /// Get plant metadata for a given token ID.
    pub fn get_plant_metadata(&self, token_id: String) -> Option<PlantMetadata> {
        self.metadata.get(&token_id)
    }
}

#[near_bindgen]
impl NonFungibleTokenCore for Contract {
    #[payable]
    fn nft_transfer(
        &mut self, 
        receiver_id: AccountId, 
        token_id: String, 
        approval_id: Option<u64>, 
        memo: Option<String>
    ) {
        // Retrieve the token details.
        let token = self.tokens.nft_token(token_id.clone()).expect("Token not found");
        let caller = env::predecessor_account_id();
        // Allow the transfer if caller is either the token owner or is in the approved accounts list.
        assert!(
            caller == token.owner_id || self.approved_accounts.contains(&caller),
            "Sender not approved"
        );
        self.tokens.nft_transfer(receiver_id, token_id, approval_id, memo)
    }

    #[payable]
    fn nft_transfer_call(
        &mut self, 
        receiver_id: AccountId, 
        token_id: String, 
        approval_id: Option<u64>, 
        memo: Option<String>, 
        msg: String
    ) -> PromiseOrValue<bool> {
        self.tokens.nft_transfer_call(receiver_id, token_id, approval_id, memo, msg)
    }

    fn nft_token(&self, token_id: String) -> Option<Token> {
        self.tokens.nft_token(token_id)
    }
}

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        NFTContractMetadata {
            spec: NFT_METADATA_SPEC.to_string(),
            name: "Plant NFT Collection".to_string(),
            symbol: "PLANT".to_string(),
            icon: None,
            base_uri: None,
            reference: None,
            reference_hash: None,
        }
    }
}
