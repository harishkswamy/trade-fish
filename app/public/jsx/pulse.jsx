var PulseInstr = React.createClass({
    render: function() {
        return (
            <tr className={this.props.instr.highlight}>
                <td><a href={`http://stockcharts.com/h-sc/ui?s=${this.props.instr.symbol}`} target="_blank">{this.props.instr.symbol}</a></td>
                <td className="numeric">{this.props.instr.lastPrice > this.props.instr.avgMa ? this.props.instr.rank : ''}</td>
                <td>{new Date(this.props.instr.lastDate).toLocaleDateString('en-US')}</td>
                <td className="numeric">{this.props.instr.lastPrice.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.avgMa.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.avgPctChg.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.pctChgYtd.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.pctChgMtd.toFixed(2)}</td>
                <td className="numeric">{this.props.instr.pctChg1Mo.toFixed(2)}</td>
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
                            <th className="numeric">% Change YTD</th>
                            <th className="numeric">% Change MTD</th>
                            <th className="numeric">% Change 1 Mos</th>
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
    
    refreshPortfolios: function() {
        $.ajax({
            url: this.props.url + '/refresh',
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
    
    handleClick: function(e) {
        e.preventDefault();
        this.refreshPortfolios();
    },

    render: function() {
        var pfolios = this.state.portfolios.map(function(portfolio) {
            return (
                <div className="pulse">
                    <Portfolio portfolio={portfolio} key={portfolio.name} />
                </div>
            );
        });
        return (
            <div>
                <div className="row">
                    <div className="col-md-2 col-md-offset-10">
                        <button type="button" className="btn btn-primary" onClick={this.handleClick}>
                            <i className="glyphicon glyphicon-refresh" aria-hidden="true"></i> Refresh
                        </button>
                    </div>
                </div>
                {pfolios}
            </div>
        );
    }
});

ReactDOM.render(
    <Pulse url="/api/pulse" />,
    document.getElementById('content')
);
