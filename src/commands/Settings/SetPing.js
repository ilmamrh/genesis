'use strict';

const Command = require('../../Command.js');
const CommonFunctions = require('../../CommonFunctions.js');
const { eventTypes, rewardTypes, opts } = require('../../resources/trackables.json');

const callables = eventTypes.concat(rewardTypes).concat(opts);

class SetPing extends Command {
  constructor(bot) {
    super(bot, 'settings.setping', 'set ping');
    this.usages = [
      { description: 'Set ping for an event or item', parameters: ['event or reward', '@role or user mention'] },
    ];
    this.regex = new RegExp(`^${this.call}\\s*((${callables.join('|')})(.+)?)?`, 'i');
    this.requiresAuth = true;
    this.allowDM = false;
  }

  async run(message) {
    const regex = new RegExp(`(cetus\\.day\\.[0-1]?[0-9]?[0-9]?|cetus\\.night\\.[0-1]?[0-9]?[0-9]?|${callables.join('|')})(.+)?`, 'i');
    const match = message.content.match(regex);
    if (message.channel.type === 'dm') {
      this.messagemanager.reply(message, 'Operator, you can\'t do that privately, it\'s the same as directly messaging you anyway!');
      return this.messageManager.statuses.FAILURE;
    } else if (match) {
      const trackables = CommonFunctions.trackablesFromParameters(match[1].trim().split(' '));
      const eventsAndItems = [].concat(trackables.events).concat(trackables.items);
      const pingString = match[2] ? match[2].trim() : undefined;

      if (!eventsAndItems.length) {
        const prefix = await this.bot.settings.getGuildSetting(message.guild, 'prefix');
        this.messageManager.embed(
          message,
          CommonFunctions.getTrackInstructionEmbed(message, prefix, this.call), true, true,
        );
        return this.messageManager.statuses.FAILURE;
      }
      const results = [];
      eventsAndItems.forEach((eventOrItem) => {
        if (eventOrItem) {
          if (!pingString) {
            this.logger.debug('No ping string.');
            results.push(this.bot.settings.removePing(message.guild, eventOrItem));
          } else {
            this.logger.debug(`${pingString} to be set for ${eventOrItem}`);
            results.push(this.bot.settings.setPing(message.guild, eventOrItem, pingString));
          }
        }
      });
      Promise.all(results);
      this.messageManager.notifySettingsChange(message, true, true);
      return this.messageManager.statuses.SUCCESS;
    }
    const prefix = await this.bot.settings.getGuildSetting(message.guild, 'prefix');
    await this.messageManager.embed(message, CommonFunctions
      .getTrackInstructionEmbed(message, prefix, this.call), true, true);
    return this.messageManager.statuses.FAILURE;
  }
}

module.exports = SetPing;
