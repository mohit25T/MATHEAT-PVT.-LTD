/**
 * Automated Quality Control Evaluation Engine
 * Prevents arbitrary manual PASS typing.
 * Evaluates Hardness, Case Depth, and Metallography against specifications.
 */
export const evaluateQC = (inspectionData, partSpec) => {
  const results = {
    hardnessResult: 'PASS',
    caseDepthResult: 'PASS',
    metallographyResult: 'PASS',
    overallResult: 'PASS',
    reasons: []
  };

  // 1. Surface Hardness Evaluation
  const surfaceReadings = inspectionData.hardness?.sampleReadings || [];
  if (surfaceReadings.length > 0) {
    const sum = surfaceReadings.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
    const avg = Number((sum / surfaceReadings.length).toFixed(1));
    inspectionData.hardness.averageValue = avg;

    const min = Number(inspectionData.hardness.specifiedMin);
    const max = Number(inspectionData.hardness.specifiedMax);

    // Check individual readings & average
    const outOfSpecReadings = surfaceReadings.filter(r => r.value < min || r.value > max);
    if (outOfSpecReadings.length > 0 || avg < min || avg > max) {
      results.hardnessResult = 'FAIL';
      results.reasons.push(
        `Surface Hardness out of spec: Avg ${avg} ${inspectionData.hardness.scale} (Req: ${min}-${max} ${inspectionData.hardness.scale})`
      );
    }
  } else {
    results.hardnessResult = 'FAIL';
    results.reasons.push('No surface hardness sample readings provided');
  }

  // Core Hardness (if specified)
  const coreReadings = inspectionData.hardness?.coreReadings || [];
  if (inspectionData.hardness?.coreSpecifiedMin && coreReadings.length > 0) {
    const coreSum = coreReadings.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
    const coreAvg = Number((coreSum / coreReadings.length).toFixed(1));
    inspectionData.hardness.coreAverageValue = coreAvg;

    const cMin = Number(inspectionData.hardness.coreSpecifiedMin);
    const cMax = Number(inspectionData.hardness.coreSpecifiedMax || 999);

    if (coreAvg < cMin || coreAvg > cMax) {
      results.hardnessResult = 'FAIL';
      results.reasons.push(`Core Hardness out of spec: Avg ${coreAvg} (Req: ${cMin}-${cMax})`);
    }
  }

  inspectionData.hardness.result = results.hardnessResult;

  // 2. Case Depth Evaluation
  if (inspectionData.caseDepth?.required) {
    const actualEff = Number(inspectionData.caseDepth.actualEffectiveMm || 0);
    const minEff = Number(inspectionData.caseDepth.specifiedEffectiveMin || 0);
    const maxEff = Number(inspectionData.caseDepth.specifiedEffectiveMax || 999);

    if (actualEff < minEff || actualEff > maxEff) {
      results.caseDepthResult = 'FAIL';
      results.reasons.push(`Effective Case Depth ${actualEff} mm outside range (${minEff} - ${maxEff} mm)`);
    }
    inspectionData.caseDepth.result = results.caseDepthResult;
  } else {
    inspectionData.caseDepth.result = 'NOT_APPLICABLE';
  }

  // 3. Metallography Evaluation
  if (inspectionData.metallography?.required) {
    const ra = Number(inspectionData.metallography.retainedAustenitePercent || 0);
    const raLimit = Number(inspectionData.metallography.retainedAusteniteLimit || 15);
    const decarb = Number(inspectionData.metallography.decarburizationDepthMm || 0);

    if (ra > raLimit) {
      results.metallographyResult = 'FAIL';
      results.reasons.push(`Retained Austenite ${ra}% exceeds limit of ${raLimit}%`);
    }
    if (decarb > 0.05) {
      results.metallographyResult = 'FAIL';
      results.reasons.push(`Decarburization observed: ${decarb} mm`);
    }
    inspectionData.metallography.result = results.metallographyResult;
  }

  // Overall Outcome
  if (
    results.hardnessResult === 'FAIL' ||
    results.caseDepthResult === 'FAIL' ||
    results.metallographyResult === 'FAIL' ||
    inspectionData.visualInspection?.cracksObserved
  ) {
    results.overallResult = 'FAIL';
  } else {
    results.overallResult = 'PASS';
  }

  inspectionData.overallResult = results.overallResult;
  return { results, inspectionData };
};
