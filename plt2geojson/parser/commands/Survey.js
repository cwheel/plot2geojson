class Survey {
    static command = 'N';

    parse(args, ctx, plot) {
        const surveys = plot.surveys || [];
        surveys.push({
            name: args[0],
            // YYYY/MM/DD
            date: new Date(`${args[4]}/${args[2]}/${args[3]}`),
        });

        ctx.currentSurvey = surveys.length - 1;

        return {
            surveys,
        };
    }
}

export default Survey;
