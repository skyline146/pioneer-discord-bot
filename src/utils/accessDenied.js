module.exports = async interaction => {
    await interaction.reply({ content: `⛔ У вас нет прав для выполнения этой команды.`, ephemeral: true });
};
