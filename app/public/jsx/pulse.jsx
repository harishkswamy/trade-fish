var PulseInstr = React.createClass({
    render: function() {
        return (
            <tr>
                <td>{this.props.instr.symbol}</td>
                <td className="numeric">{this.props.instr.lastPrice > this.props.instr.avgMa ? this.props.instr.rank : ''}</td>
                <td>{new Date(this.props.instr.lastDate).toLocaleDateString('en-US')}</td>
                <td className="numeric">{this.props.instr.lastPrice.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.avgMa.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.avgPctChg.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.pctChgMtd.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.pctChg3Mo.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.pctChg6Mo.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.pctChg12Mo.toFixed(2)}</td>
            </tr>
        );
    }
});

var Portfolio = React.createClass({
    render: function() {
        var pulseInstrs = this.props.portfolio.instrs.map(function(instr) {
            return (
                <PulseInstr instr={instr} key={instr.symbol} />
            );
        });
        return (
            <div>
                <h2 className="portfolio">
                    {this.props.portfolio.name}
                </h2>
                <table className="table table-condensed table-hover">
                    <thead>
                        <tr>
                            <th>Symbol</th>
                            <th className="numeric">Rank</th>
                            <th>Last Date</th>
                            <th className="numeric">Last Price</th>
                            <th className="numeric">Avg MA</th>
                            <th className="numeric">Avg % Change</th>
                            <th className="numeric">% Change MTD</th>
                            <th className="numeric">% Change 3 Mos</th>
                            <th className="numeric">% Change 6 Mos</th>
                            <th className="numeric">% Change 12 Mos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pulseInstrs}
                    </tbody>
                </table>
            </div>
        );
    }
});

var Pulse = React.createClass({
    loadPortfolios: function() {
        $.ajax({
        url: this.props.url,
        dataType: 'json',
        cache: false,
        success: function(data) {
            this.setState({portfolios: data});
        }.bind(this),
        error: function(xhr, status, err) {
            console.error(this.props.url, status, err.toString());
        }.bind(this)
        });
    },

    componentDidMount: function() {
        this.loadPortfolios();
    },

    getInitialState: function() {
        return {portfolios: [{instrs: []}]};
    },

    render: function() {
        var pfolios = this.state.portfolios.map(function(portfolio) {
            return (
                <div className="pulse" key={portfolio.name}>
                    <Portfolio portfolio={portfolio} />
                </div>
            );
        });
        return (
            <div>
                {pfolios}
            </div>
        );
    }
});

ReactDOM.render(
  <Pulse url="/api/pulse" />,
  document.getElementById('content')
);