"""Regression suite: evolution-aware level requirements and concurrent status writes.

Safe standalone test. Never touches game saves or the active parallel lab state.
"""
import concurrent.futures
import json
import pathlib
import sys
import tempfile
import unittest

HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import level_gate
import parallel_lab_service as supervisor

class TestEvolutionGate(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        source=(HERE.parent/"data"/"species.js").read_text(encoding="utf8")
        cls.catalog=json.loads(source.split("=",1)[1].strip().rstrip(";"))
        assert len(cls.catalog)==150

    def test_run041_real_example_miora_evolves(self):
        requirements=level_gate.make_requirements(
            [{"id":1,"lv":5},{"id":38,"lv":3}],self.catalog,2)
        self.assertEqual(requirements[0]["lineage"],[1,2,3])
        self.assertTrue(level_gate.meets_level_gate(
            [{"id":2,"lv":9},{"id":38,"lv":5}],requirements))
        self.assertFalse(level_gate.meets_level_gate(
            [{"id":1,"lv":6},{"id":38,"lv":5}],requirements))
        self.assertFalse(level_gate.meets_level_gate(
            [{"id":2,"lv":9},{"id":38,"lv":4}],requirements))

    def test_three_step_evolution_and_unrelated_species(self):
        requirements=level_gate.make_requirements([{"id":1,"lv":5}],self.catalog,10)
        self.assertTrue(level_gate.meets_level_gate([{"id":3,"lv":16}],requirements))
        self.assertFalse(level_gate.meets_level_gate([{"id":3,"lv":14}],requirements))
        self.assertFalse(level_gate.meets_level_gate([{"id":7,"lv":30}],requirements))

    def test_duplicate_species_are_distinct_individuals(self):
        r=level_gate.make_requirements([{"id":5,"lv":7},{"id":5,"lv":8}],self.catalog,2)
        self.assertFalse(level_gate.meets_level_gate([{"id":6,"lv":12},{"id":5,"lv":9}],r))
        self.assertTrue(level_gate.meets_level_gate([{"id":6,"lv":12},{"id":6,"lv":10}],r))
        self.assertFalse(level_gate.meets_level_gate([{"id":6,"lv":12}],r))
        # A different creature in the same slot does not satisfy the condition.
        self.assertFalse(level_gate.meets_level_gate([{"id":6,"lv":12},{"id":7,"lv":30}],r))

class TestAtomicStatusWrites(unittest.TestCase):
    def test_300_concurrent_json_writes_no_worker_death(self):
        previous=supervisor.OUT
        with tempfile.TemporaryDirectory() as tmp:
            try:
                supervisor.OUT=pathlib.Path(tmp)
                with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
                    calls=list(pool.map(lambda _: supervisor.persist(),range(300)))
                self.assertTrue(all(calls))
                record=json.loads((supervisor.OUT/"status.json").read_text(encoding="utf8"))
                self.assertEqual(record["total"],100)
                self.assertEqual(len(record["variants"]),100)
                self.assertEqual(sum(record["counts"].values()),100)
            finally:
                supervisor.OUT=previous

if __name__=="__main__":
    unittest.main(verbosity=2)
