import { useEffect, useState, type MouseEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { CVSSCalculatorProps } from "../types/types";

type CvssVersion = "3.0" | "3.1";
type AttackVector = "N" | "A" | "L" | "P";
type AttackComplexity = "L" | "H";
type PrivilegesRequired = "N" | "L" | "H";
type UserInteraction = "N" | "R";
type Scope = "U" | "C";
type Impact = "N" | "L" | "H";

const ATTACK_VECTORS = ["N", "A", "L", "P"] as const;
const ATTACK_COMPLEXITIES = ["L", "H"] as const;
const PRIVILEGES_REQUIRED = ["N", "L", "H"] as const;
const USER_INTERACTIONS = ["N", "R"] as const;
const SCOPES = ["U", "C"] as const;
const IMPACTS = ["N", "L", "H"] as const;

interface Weights {
  AV: Record<AttackVector, number>;
  AC: Record<AttackComplexity, number>;
  PR: Record<Scope, Record<PrivilegesRequired, number>>;
  UI: Record<UserInteraction, number>;
  S: Record<Scope, number>;
  C: Record<Impact, number>;
  I: Record<Impact, number>;
  A: Record<Impact, number>;
}

const weights: Weights = {
  AV: { N: 0.85, A: 0.62, L: 0.55, P: 0.2 },
  AC: { L: 0.77, H: 0.44 },
  PR: {
    U: { N: 0.85, L: 0.62, H: 0.27 },
    C: { N: 0.85, L: 0.68, H: 0.5 },
  },
  UI: { N: 0.85, R: 0.62 },
  S: { U: 6.42, C: 7.52 },
  C: { N: 0, L: 0.22, H: 0.56 },
  I: { N: 0, L: 0.22, H: 0.56 },
  A: { N: 0, L: 0.22, H: 0.56 },
};

function pickMetric<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
  fallback: T
): T {
  return allowedValues.includes(value as T) ? (value as T) : fallback;
}

function CVSSCalculator({ initialValue, onCalculate }: CVSSCalculatorProps) {
  const [version, setVersion] = useState<CvssVersion>("3.1");
  const [attackVector, setAttackVector] = useState<AttackVector>("N");
  const [attackComplexity, setAttackComplexity] =
    useState<AttackComplexity>("L");
  const [privilegesRequired, setPrivilegesRequired] =
    useState<PrivilegesRequired>("N");
  const [userInteraction, setUserInteraction] = useState<UserInteraction>("N");
  const [scope, setScope] = useState<Scope>("U");
  const [confidentialityImpact, setConfidentialityImpact] =
    useState<Impact>("H");
  const [integrityImpact, setIntegrityImpact] = useState<Impact>("H");
  const [availabilityImpact, setAvailabilityImpact] = useState<Impact>("H");
  const [currentScore, setCurrentScore] = useState<number | undefined>();

  useEffect(() => {
    setVersion("3.1");
    setAttackVector(
      pickMetric(initialValue?.attackVector, ATTACK_VECTORS, "N")
    );
    setAttackComplexity(
      pickMetric(initialValue?.attackComplexity, ATTACK_COMPLEXITIES, "L")
    );
    setPrivilegesRequired(
      pickMetric(initialValue?.privilegesRequired, PRIVILEGES_REQUIRED, "N")
    );
    setUserInteraction(
      pickMetric(initialValue?.userInteraction, USER_INTERACTIONS, "N")
    );
    setScope(pickMetric(initialValue?.scope, SCOPES, "U"));
    setConfidentialityImpact(
      pickMetric(initialValue?.confidentialityImpact, IMPACTS, "H")
    );
    setIntegrityImpact(
      pickMetric(initialValue?.integrityImpact, IMPACTS, "H")
    );
    setAvailabilityImpact(
      pickMetric(initialValue?.availabilityImpact, IMPACTS, "H")
    );
    setCurrentScore(initialValue?.score);
  }, [initialValue]);

  function calculateScore(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    const impactSubScore =
      1 -
      (1 - weights.C[confidentialityImpact]) *
        (1 - weights.I[integrityImpact]) *
        (1 - weights.A[availabilityImpact]);

    const modifiedImpactSubScore =
      scope === "U"
        ? weights.S.U * impactSubScore
        : weights.S.C * (impactSubScore - 0.029) -
          3.25 * Math.pow(impactSubScore - 0.02, 15);

    const exploitabilityScore =
      8.22 *
      weights.AV[attackVector] *
      weights.AC[attackComplexity] *
      weights.PR[scope][privilegesRequired] *
      weights.UI[userInteraction];

    const baseScore =
      impactSubScore <= 0
        ? 0
        : scope === "U"
        ? Math.min(modifiedImpactSubScore + exploitabilityScore, 10)
        : Math.min(1.08 * (modifiedImpactSubScore + exploitabilityScore), 10);

    const finalScore = Math.ceil(baseScore * 10) / 10;

    setCurrentScore(finalScore);
    onCalculate({
      attackVector,
      attackComplexity,
      privilegesRequired,
      userInteraction,
      scope,
      confidentialityImpact,
      integrityImpact,
      availabilityImpact,
      score: finalScore,
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Calculadora de CVSS</h1>

      {currentScore !== undefined && (
        <p className="mb-4 rounded-md border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-300">
          CVSS atual: {currentScore}
        </p>
      )}

      <div className="mb-6">
        <Label>Versão do CVSS</Label>
        <Select
          value={version}
          onValueChange={(value) => setVersion(value as CvssVersion)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a versão" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3.0">CVSS 3.0</SelectItem>
            <SelectItem value="3.1">CVSS 3.1</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Base Metrics</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Attack Vector (AV)</Label>
            <Select
              value={attackVector}
              onValueChange={(value) =>
                setAttackVector(value as AttackVector)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">Network (N)</SelectItem>
                <SelectItem value="A">Adjacent (A)</SelectItem>
                <SelectItem value="L">Local (L)</SelectItem>
                <SelectItem value="P">Physical (P)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Attack Complexity (AC)</Label>
            <Select
              value={attackComplexity}
              onValueChange={(value) =>
                setAttackComplexity(value as AttackComplexity)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Privileges Required (PR)</Label>
            <Select
              value={privilegesRequired}
              onValueChange={(value) =>
                setPrivilegesRequired(value as PrivilegesRequired)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>User Interaction (UI)</Label>
            <Select
              value={userInteraction}
              onValueChange={(value) =>
                setUserInteraction(value as UserInteraction)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="R">Required (R)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Label>Scope (S)</Label>
          <Select
            value={scope}
            onValueChange={(value) => setScope(value as Scope)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="U">Unchanged (U)</SelectItem>
              <SelectItem value="C">Changed (C)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Impact Metrics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Confidentiality Impact (C)</Label>
            <Select
              value={confidentialityImpact}
              onValueChange={(value) =>
                setConfidentialityImpact(value as Impact)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Integrity Impact (I)</Label>
            <Select
              value={integrityImpact}
              onValueChange={(value) => setIntegrityImpact(value as Impact)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Availability Impact (A)</Label>
            <Select
              value={availabilityImpact}
              onValueChange={(value) => setAvailabilityImpact(value as Impact)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N">None (N)</SelectItem>
                <SelectItem value="L">Low (L)</SelectItem>
                <SelectItem value="H">High (H)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="button" onClick={calculateScore} className="mt-6">
          Salvar
        </Button>
      </div>
    </div>
  );
}

export default CVSSCalculator;
