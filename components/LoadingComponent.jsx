export default function LoadingComponent(){
    return (
        <div style={{height: '80vh', width: '80vw', display: 'grid', placeItems: 'center'}}>
            <svg height={'30vh'} viewBox="50 100 400 300">
                <rect y="300" width="200" height="100" style={{stroke: 'rgb(185, 224, 255)', fill: 'rgb(185, 224, 255)', strokeOpacity: 0.62}} x="50">
                    <animate 
                        attributeName="x"
                        values="50;250;50"
                        keyTimes="0;0.5;1"
                        dur="2s" 
                        repeatCount="indefinite"
                    />
                </rect>
                <rect x="150" y="200" width="200" height="200" style={{fill: 'rgb(141, 158, 255)', stroke: 'rgb(141, 158, 255)', strokeOpacity: 0.62, fillOpacity: 0.7}}>
                    {/* <animate attributeName="x" from="150" to="350" dur="2s" repeatCount="indefinite"/> */}
                </rect>
                <rect x="250" y="100" width="200" height="300" style={{stroke: 'rgb(108, 74, 182)', fill: 'rgb(108, 74, 182)', strokeOpacity: 0.57, paintOrder: 'stroke', fillOpacity: 0.6}}>
                    <animate 
                        attributeName="x"
                        values="250;50;250"
                        keyTimes="0;0.5;1"
                        dur="2s" 
                        repeatCount="indefinite"
                    />
                </rect>
            </svg>
        </div>
    )
}