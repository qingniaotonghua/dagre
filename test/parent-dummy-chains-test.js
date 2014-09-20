var expect = require("./chai").expect,
    Graph = require("graphlib").Graph,
    parentDummyChains = require("../lib/parent-dummy-chains");

describe("parentDummyChains", function() {
  var g;

  beforeEach(function() {
    g = new Graph({ compound: true }).setGraph({});
  });

  it("does not set a parent if both the tail and head have no parent", function() {
    g.setNode("a");
    g.setNode("b");
    g.setNode("d1", { edgeObj: { v: "a", w: "b" } });
    g.getGraph().dummyChains = ["d1"];
    g.setPath(["a", "d1", "b"]);

    parentDummyChains(g);
    expect(g.getParent("d1")).to.be.undefined;
  });

  it("uses the tail's parent for the first node if it is not the root", function() {
    g.setParent("a", "sg1");
    g.setNode("sg1", { minRank: 0, maxRank: 2 });
    g.setNode("d1", { edgeObj: { v: "a", w: "b" }, rank: 2 });
    g.getGraph().dummyChains = ["d1"];
    g.setPath(["a", "d1", "b"]);

    parentDummyChains(g);
    expect(g.getParent("d1")).equals("sg1");
  });

  it("uses the heads's parent for the first node if tail's is root", function() {
    g.setParent("b", "sg1");
    g.setNode("sg1", { minRank: 1, maxRank: 3 });
    g.setNode("d1", { edgeObj: { v: "a", w: "b" }, rank: 1 });
    g.getGraph().dummyChains = ["d1"];
    g.setPath(["a", "d1", "b"]);

    parentDummyChains(g);
    expect(g.getParent("d1")).equals("sg1");
  });

  it("handles a long chain starting in a subgraph", function() {
    g.setParent("a", "sg1");
    g.setNode("sg1", { minRank: 0, maxRank: 2 });
    g.setNode("d1", { edgeObj: { v: "a", w: "b" }, rank: 2 });
    g.setNode("d2", { rank: 3 });
    g.setNode("d3", { rank: 4 });
    g.getGraph().dummyChains = ["d1"];
    g.setPath(["a", "d1", "d2", "d3", "b"]);

    parentDummyChains(g);
    expect(g.getParent("d1")).equals("sg1");
    expect(g.getParent("d2")).to.be.undefined;
    expect(g.getParent("d3")).to.be.undefined;
  });

  it("handles a long chain ending in a subgraph", function() {
    g.setParent("b", "sg1");
    g.setNode("sg1", { minRank: 3, maxRank: 5 });
    g.setNode("d1", { edgeObj: { v: "a", w: "b" }, rank: 1 });
    g.setNode("d2", { rank: 2 });
    g.setNode("d3", { rank: 3 });
    g.getGraph().dummyChains = ["d1"];
    g.setPath(["a", "d1", "d2", "d3", "b"]);

    parentDummyChains(g);
    expect(g.getParent("d1")).to.be.undefined;
    expect(g.getParent("d2")).to.be.undefined;
    expect(g.getParent("d3")).equals("sg1");
  });

  it("handles nested subgraphs", function() {
    g.setParent("a", "sg2");
    g.setParent("sg2", "sg1");
    g.setNode("sg1", { minRank: 0, maxRank: 4 });
    g.setNode("sg2", { minRank: 1, maxRank: 3 });
    g.setParent("b", "sg4");
    g.setParent("sg4", "sg3");
    g.setNode("sg3", { minRank: 6, maxRank: 10 });
    g.setNode("sg4", { minRank: 7, maxRank:  9 });
    for (var i = 0; i < 5; ++i) {
      g.setNode("d" + (i + 1), { rank: i + 3  });
    }
    g.getNode("d1").edgeObj = { v: "a", w: "b" };
    g.getGraph().dummyChains = ["d1"];
    g.setPath(["a", "d1", "d2", "d3", "d4", "d5", "b"]);

    parentDummyChains(g);
    expect(g.getParent("d1")).equals("sg2");
    expect(g.getParent("d2")).equals("sg1");
    expect(g.getParent("d3")).to.be.undefined;
    expect(g.getParent("d4")).equals("sg3");
    expect(g.getParent("d5")).equals("sg4");
  });

  it("handles overlapping rank ranges", function() {
    g.setParent("a", "sg1");
    g.setNode("sg1", { minRank: 0, maxRank: 3 });
    g.setParent("b", "sg2");
    g.setNode("sg2", { minRank: 2, maxRank: 6 });
    g.setNode("d1", { edgeObj: { v: "a", w: "b" }, rank: 2 });
    g.setNode("d2", { rank: 3 });
    g.setNode("d3", { rank: 4 });
    g.getGraph().dummyChains = ["d1"];
    g.setPath(["a", "d1", "d2", "d3", "b"]);

    parentDummyChains(g);
    expect(g.getParent("d1")).equals("sg1");
    expect(g.getParent("d2")).equals("sg1");
    expect(g.getParent("d3")).equals("sg2");
  });
});
