export function ArtPanel() {
  return (
    <aside className="auth-art">
      <div>
        <div className="art-tag">
          <span className="pulse"></span>
          <span>Live · 24/7 secured banking</span>
        </div>
      </div>

      <div>
        <h2 className="art-headline">
          Money that <em>moves</em><br/>at the speed of your life.
        </h2>

        <div className="art-card-stack">
          <div className="art-card c1">
            <div className="row">
              <div>
                <div className="label">Everyday</div>
                <div className="balance">$2,840<span style={{fontSize:18, opacity:.6}}>.55</span></div>
              </div>
              <div style={{fontSize: 18}}>◐</div>
            </div>
            <div className="num">•••• •••• •••• 4621</div>
          </div>
          <div className="art-card c2">
            <div className="row">
              <div>
                <div className="label">Travel</div>
                <div className="balance">$6,120<span style={{fontSize:18, opacity:.6}}>.00</span></div>
              </div>
              <div style={{fontSize: 18}}>✈</div>
            </div>
            <div className="num">•••• •••• •••• 1085</div>
          </div>
          <div className="art-card c3">
            <div className="row">
              <div>
                <div className="label">Emergency</div>
                <div className="balance">$12,000<span style={{fontSize:18, opacity:.6}}>.00</span></div>
              </div>
              <div style={{fontSize: 18}}>◈</div>
            </div>
            <div className="num">•••• •••• •••• 9930</div>
          </div>
        </div>
      </div>

      <div className="art-stats">
        <div className="art-stat">
          <div className="num">256-bit</div>
          <div className="lbl">End-to-end encryption</div>
        </div>
        <div className="art-stat">
          <div className="num">$0</div>
          <div className="lbl">Hidden fees, ever</div>
        </div>
        <div className="art-stat">
          <div className="num">120k+</div>
          <div className="lbl">People trust us with their money</div>
        </div>
      </div>
    </aside>
  );
}
