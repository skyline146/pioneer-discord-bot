module.exports = async interaction => {
    await interaction.reply({ content: `:lock: У вас нет прав для выполнения этой команды.`, ephemeral: true });
};
