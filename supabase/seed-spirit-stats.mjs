import 'dotenv/config';

import {pool} from '../server/db.js';

const abramsHeroId = '5b1a4a24-d4ca-4914-9985-9ba58de1b8ae';

const abramsSpiritStats = {
	hero_id: abramsHeroId,
	ability_cooldown_percent: 0,
	ability_cooldown_percent_boon_scaling: null,
	ability_cooldown_percent_spirit_scaling: null,
	ability_cooldown_percent_weapon_scaling: null,
	ability_duration_percent: 0,
	ability_duration_percent_boon_scaling: null,
	ability_duration_percent_spirit_scaling: null,
	ability_duration_percent_weapon_scaling: null,
	ability_range_percent: 0,
	ability_range_percent_boon_scaling: null,
	ability_range_percent_spirit_scaling: null,
	ability_range_percent_weapon_scaling: null,
	spirit_lifesteal_percent: 0,
	spirit_lifesteal_percent_boon_scaling: null,
	spirit_lifesteal_percent_spirit_scaling: null,
	spirit_lifesteal_percent_weapon_scaling: null,
	max_charges_increase: 0,
	max_charges_increase_boon_scaling: null,
	max_charges_increase_spirit_scaling: null,
	max_charges_increase_weapon_scaling: null,
	charge_cooldown_percent: 0,
	charge_cooldown_percent_boon_scaling: null,
	charge_cooldown_percent_spirit_scaling: null,
	charge_cooldown_percent_weapon_scaling: null,
	spirit_power: 0,
	spirit_power_boon_scaling: null,
	spirit_power_spirit_scaling: null,
	spirit_power_weapon_scaling: null,
};

const upsertAbramsSpiritStats = async (client, row) => {
	await client.query(
		`insert into hero_spirit_stats (
			hero_id,
			ability_cooldown_percent,
			ability_cooldown_percent_boon_scaling,
			ability_cooldown_percent_spirit_scaling,
			ability_cooldown_percent_weapon_scaling,
			ability_duration_percent,
			ability_duration_percent_boon_scaling,
			ability_duration_percent_spirit_scaling,
			ability_duration_percent_weapon_scaling,
			ability_range_percent,
			ability_range_percent_boon_scaling,
			ability_range_percent_spirit_scaling,
			ability_range_percent_weapon_scaling,
			spirit_lifesteal_percent,
			spirit_lifesteal_percent_boon_scaling,
			spirit_lifesteal_percent_spirit_scaling,
			spirit_lifesteal_percent_weapon_scaling,
			max_charges_increase,
			max_charges_increase_boon_scaling,
			max_charges_increase_spirit_scaling,
			max_charges_increase_weapon_scaling,
			charge_cooldown_percent,
			charge_cooldown_percent_boon_scaling,
			charge_cooldown_percent_spirit_scaling,
			charge_cooldown_percent_weapon_scaling,
			spirit_power,
			spirit_power_boon_scaling,
			spirit_power_spirit_scaling,
			spirit_power_weapon_scaling
		)
		values (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
			$11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
			$21, $22, $23, $24, $25, $26, $27, $28, $29
		)
		on conflict (hero_id) do update
		set
			ability_cooldown_percent = excluded.ability_cooldown_percent,
			ability_cooldown_percent_boon_scaling = excluded.ability_cooldown_percent_boon_scaling,
			ability_cooldown_percent_spirit_scaling = excluded.ability_cooldown_percent_spirit_scaling,
			ability_cooldown_percent_weapon_scaling = excluded.ability_cooldown_percent_weapon_scaling,
			ability_duration_percent = excluded.ability_duration_percent,
			ability_duration_percent_boon_scaling = excluded.ability_duration_percent_boon_scaling,
			ability_duration_percent_spirit_scaling = excluded.ability_duration_percent_spirit_scaling,
			ability_duration_percent_weapon_scaling = excluded.ability_duration_percent_weapon_scaling,
			ability_range_percent = excluded.ability_range_percent,
			ability_range_percent_boon_scaling = excluded.ability_range_percent_boon_scaling,
			ability_range_percent_spirit_scaling = excluded.ability_range_percent_spirit_scaling,
			ability_range_percent_weapon_scaling = excluded.ability_range_percent_weapon_scaling,
			spirit_lifesteal_percent = excluded.spirit_lifesteal_percent,
			spirit_lifesteal_percent_boon_scaling = excluded.spirit_lifesteal_percent_boon_scaling,
			spirit_lifesteal_percent_spirit_scaling = excluded.spirit_lifesteal_percent_spirit_scaling,
			spirit_lifesteal_percent_weapon_scaling = excluded.spirit_lifesteal_percent_weapon_scaling,
			max_charges_increase = excluded.max_charges_increase,
			max_charges_increase_boon_scaling = excluded.max_charges_increase_boon_scaling,
			max_charges_increase_spirit_scaling = excluded.max_charges_increase_spirit_scaling,
			max_charges_increase_weapon_scaling = excluded.max_charges_increase_weapon_scaling,
			charge_cooldown_percent = excluded.charge_cooldown_percent,
			charge_cooldown_percent_boon_scaling = excluded.charge_cooldown_percent_boon_scaling,
			charge_cooldown_percent_spirit_scaling = excluded.charge_cooldown_percent_spirit_scaling,
			charge_cooldown_percent_weapon_scaling = excluded.charge_cooldown_percent_weapon_scaling,
			spirit_power = excluded.spirit_power,
			spirit_power_boon_scaling = excluded.spirit_power_boon_scaling,
			spirit_power_spirit_scaling = excluded.spirit_power_spirit_scaling,
			spirit_power_weapon_scaling = excluded.spirit_power_weapon_scaling,
			updated_at = now()
		` ,
		Object.values(row),
	);
};

const client = await pool.connect();
try {
	await client.query('begin');
	await upsertAbramsSpiritStats(client, abramsSpiritStats);
	await client.query('commit');
	console.log({hero_id: abramsHeroId, spirit_stats_seeded: true});
} catch (error) {
	await client.query('rollback');
	throw error;
} finally {
	client.release();
	await pool.end();
}
