module contract_nft::c_nft {
    use std::string::{String, utf8};
    use sui::clock::Clock;
    use sui::package;
    use sui::display;
    use sui::table::{Self, Table};
    use sui::event;

    public struct C_NFT has drop {}

    public struct CNFT has key, store {
        id: UID,
        nft_id: u64,
        name: String,
        image_url: String,
        creator: address,
        recipient: address,
        blob_id: String,
        start_epoch: u64,
        end_epoch: u64,
        create_date: u64
    }

    public struct NFTMinted has copy, drop {
        object_id: ID,
        creator: address,
        name: String,
    }

    public struct MintRecord has key {
        id: UID,
        record: Table<u64, address>,
    }

    const MAX_SUPPLY: u64 = 1000000;

    const ENotEnoughSupply: u64 = 0;

    const EDontMintAgain: u64 = 1;

    fun init(otw: C_NFT, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"description"),
            utf8(b"image_url"),
            utf8(b"creator"),
            utf8(b"blob_id"),
            utf8(b"start_epoch"),
            utf8(b"end_epoch"),
            utf8(b"create_date")
        ];
        let values = vector[
            utf8(b"{name} #{nft_id}"),
            utf8(b"A NFT for your signed contract record"),
            utf8(b"{image_url}"),
            utf8(b"{creator}"),
            utf8(b"{blob_id}"),
            utf8(b"{start_epoch}"),
            utf8(b"{end_epoch}"),
            utf8(b"{create_date}")
        ];
        let mint_record = MintRecord {
            id: object::new(ctx),
            record: table::new<u64, address>(ctx),
        };

        let publisher = package::claim(otw, ctx);
        let mut display = display::new_with_fields<CNFT>(&publisher, keys, values, ctx);

        transfer::share_object(mint_record);
        display::update_version(&mut display);
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(display, ctx.sender());
    }

    public entry fun mint(
        mint_record: &mut MintRecord,
        name: String,
        image_url: String,
        recipient: address,
        blob_id: String,
        start_epoch: u64,
        end_epoch: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // assert!(!table::contains(&mint_record.record, recipient), EDontMintAgain);

        let nft_id: u64 = table::length(&mint_record.record) + 1;
        table::add(&mut mint_record.record, nft_id, recipient);
        assert!(nft_id <= MAX_SUPPLY, ENotEnoughSupply);

        let nft = CNFT {
            id: object::new(ctx),
            nft_id,
            name,
            image_url,
            creator: ctx.sender(),
            recipient,
            blob_id,
            start_epoch,
            end_epoch,
            create_date: clock.timestamp_ms()
        };

        event::emit(NFTMinted {
            object_id: object::id(&nft),
            creator: ctx.sender(),
            name: nft.name,
        });

        transfer::public_transfer(nft, recipient);
    }

    public entry fun burn(mint_record: &mut MintRecord, nft: CNFT) {
        table::remove(&mut mint_record.record, nft.nft_id);
        let CNFT { id, nft_id: _, name: _, image_url: _, creator: _, recipient: _, blob_id: _, start_epoch: _, end_epoch: _, create_date: _ } = nft;
        object::delete(id);
    }
}