module.exports = async (cooldown, interaction, time) => {
    if (cooldown.has(interaction.user.id)) {
        await interaction.reply({
            content: `Эту команду можно использовать 1 раз в ${time} секунд!`,
            ephemeral: true,
        });
        return true;
    } else {
        return false;
    }
};
