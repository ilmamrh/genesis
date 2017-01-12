'use strict';

const Query = require('warframe-location-query');
const Command = require('../Command.js');

const extraSpace = '　　';

/**
 * Looks up locations of items
 */
class Whereis extends Command {
  /**
   * Constructs a callable command
   * @param {Genesis} bot  The bot object
   */
  constructor(bot) {
    super(bot, 'misc.whereis', 'whereis', 'whereis');
    this.regex = new RegExp(`^${this.bot.escapedPrefix}where(?:\\s?is)?(?:\\s+([\\w+\\s]+))?`, 'i');

    this.usages = [
      {
        description: 'Display where an item drops',
        parameters: ['item'],
      },
    ];

    this.querier = new Query();
  }

  /**
   * Run the command
   * @param {Message} message Message with a command to handle, reply to,
   *                          or perform an action based on parameters.
   */
  run(message) {
    const item = message.content.match(this.regex)[1];
    this.querier.getAll(item)
      .then((results) => {
        const color = Object.prototype.toString.call(results) === '[object Array]' ? 0x00ff00 : 0xff0000;
        const fields = Object.prototype.toString.call(results) !== '[object Array]'
          ? [{ name: '_ _', value: 'Operator, there is no such item location available.' }] : [];

        if (Object.prototype.toString.call(results) === '[object Array]') {
          results.forEach((result) => {
            fields.push({
              name: result.component + (result.type === 'Prime Part' ?
                ` worth ${result.ducats}` : ''),
              value: result.locations.join(`,${this.bot.md.lineEnd}${extraSpace}`),
            });
          });
        }
        const embed = {
          color,
          title: 'Warframe Where Is?',
          url: 'https://warframe.com',
          description: `Location query for ${item}`,
          fields,
          footer: {
            icon_url: 'https://avatars1.githubusercontent.com/u/24436369',
            text: 'Data evaluated by warframe-location-query, Warframe Community Developers',
          },
        };
        message.channel.sendEmbed(embed);
      })
      .catch(this.logger.error);
  }
}

module.exports = Whereis;