/**
 * 관세청 UNI-PASS API 타입 정의
 * https://unipass.customs.go.kr
 */

// --- API001: 화물통관진행정보 ---

export interface CargoTrackingItem {
  cargMtNo: string;
  prgsStts: string;
  prgsSttsCd: string;
  csclPrgsDate: string;
}

// --- API020: 컨테이너내역 ---

export interface ContainerItem {
  cntrNo: string;
  cntrSzCd: string;
  sealNo: string;
}

// --- API022: 수입신고 검증 ---

export interface DeclarationItem {
  dclrNo: string;
  dclrDt: string;
  dclrSttsCd: string;
  dclrSttsNm: string;
  blNo: string;
  trdnNm: string;
  hsSgn: string;
  wght: string;
  gcnt: string;
}

// --- API018: HS코드 검색 ---

export interface HsCodeItem {
  hsSgn: string;
  korePrnm: string;
  englPrnm: string;
  txrt: string;
  txtpSgn: string;
  wghtUt: string;
}

// --- API030: 관세율 기본 조회 ---

export interface TariffRateItem {
  hsSgn: string;
  trrt: string;
  trrtTpcd: string;
  trrtTpNm: string;
  aplyStrtDt: string;
  aplyEndDt: string;
}

// --- API012: 관세환율 ---

export interface CustomsExchangeRateItem {
  currSgn: string;
  fxrt: string;
  aplyBgnDt: string;
  mtryUtNm: string;
  cntySgn: string;
  imexTp: string;
}

export interface CustomsExchangeRateResult {
  rates: CustomsExchangeRateItem[];
  queriedDate: string;
  isFallback: boolean;
}

// --- API010: 통관고유부호 업체 조회 ---

export interface CompanyItem {
  ecm: string;
  conmNm: string;
  bsnsNo: string;
  rppnNm: string;
  bslcBscsAddr: string;
  rprsTelno: string;
  useYn: string;
}

// --- API013: 관세사부호 조회 ---

export interface BrokerItem {
  lcaSgn: string;
  lcaNm: string;
  cstmSgn: string;
  cstmNm: string;
}

// --- API004: 검사검역내역 ---

export interface InspectionItem {
  inqrRsltCd: string;
  inqrRsltNm: string;
  inqrDt: string;
}

// --- API021: 입항보고내역 (해상) ---

export interface ArrivalReportItem {
  vydfNm: string;
  etprCstm: string;
  etprDt: string;
  msrm: string;
}

// --- API033: 농림축산검역 업체코드 ---

export interface AnimalPlantCompanyItem {
  bsntNm: string;
  bsntCd: string;
  bsntAddr: string;
}

// --- API047: 보세구역 장치기간 ---

export interface BondedAreaItem {
  cargMtNo: string;
  strgBgnDt: string;
  strgPridExpnDt: string;
  bndAreaNm: string;
}

// --- API049: 수입 제세 납부여부 ---

export interface TaxPaymentItem {
  dclrNo: string;
  txpymDt: string;
  txpymYn: string;
  txpymAmt: string;
}

// --- API002: 수출신고번호별 수출이행 내역 ---

export interface ExportPerformanceItem {
  shpmPckUt: string;
  mnurConm: string;
  shpmCmplYn: string;
  acptDt: string;
  acptDttm: string;
  shpmWght: string;
  exppnConm: string;
  loadDtyTmIm: string;
  sanm: string;
  expDclrNo: string;
  csclWght: string;
  shpmPckGcnt: string;
  csclPckUt: string;
  csclPckGcnt: string;
  ldpInscTrgtYn: string;
}

// --- API003: 수출입요건 승인 내역 ---

export interface ImportRequirementItem {
  apreCond: string;
  issDt: string;
  lprt: string;
  relaFrmlNm: string;
  valtPrid: string;
  relaLwor: string;
  dlcn: string;
  reqApreNo: string;
}

// --- API005: 장치장 정보 ---

export interface ShedInfoItem {
  snarSgn: string;
  snarNm: string;
  snarAddr: string;
  snartelno: string;
  pnltLvyTrgtYn: string;
  adtxColtPridYn: string;
  ldunPlcSnarYn: string;
}

// --- API006: 화물운송주선업자 목록 ---

export interface ForwarderListItem {
  frwrSgn: string;
  frwrKoreNm: string;
  frwrEnglNm: string;
  rppnNm: string;
}

// --- API007: 화물운송주선업자 내역 ---

export interface ForwarderDetailItem {
  brnchAddr: string;
  brno: string;
  koreConmNm: string;
  rppnFnm: string;
  englConmNm: string;
  cntyCd: string;
  telNo: string;
  faxNo: string;
  frwrSgn: string;
  rgsrValtPridXpirDt: string;
  hdofAddr: string;
}

// --- API008: 항공사 목록 ---

export interface AirlineListItem {
  flcoEnglNm: string;
  flcoKoreNm: string;
  flcoSgn: string;
  rppnNm: string;
}

// --- API009: 항공사 내역 ---

export interface AirlineDetailItem {
  brno: string;
  flcoEnglSgn: string;
  flcoKoreConm: string;
  flcoNat: string;
  rppnFnm: string;
  cntyNm: string;
  telno: string;
  faxNo: string;
  flcoEnglConm: string;
  flcoNumSgn: string;
  hdofAddr: string;
}

// --- API011: 해외공급자부호 ---

export interface OverseasSupplierItem {
  athzDt: string;
  englCntyNm: string;
  ovrsSplrSgn: string;
  useStopRsn: string;
  afarConmSplrConm: string;
  rprsSgn: string;
  splrAddr1: string;
  useStopStts: string;
  splrConm: string;
  splrCntyAbrt: string;
}

// --- API014: 관세사 내역 ---

export interface BrokerDetailItem {
  jrsdCstmNm: string;
  dcerPcd: string;
  lcaSgn: string;
  lcaConm: string;
  telNo: string;
  addr: string;
  rppnNm: string;
}

// --- API015: 간이정액 환급율표 ---

export interface SimpleDrawbackItem {
  prutDrwbWncrAmt: string;
  stsz: string;
  drwbAmtBaseTpcd: string;
  aplyDd: string;
  ceseDt: string;
  hs10: string;
}

// --- API016: 간이정액 적용/비적용 업체 ---

export interface SimpleDrawbackCompanyItem {
  simlFxamtNnaplyApreDt: string;
  conm: string;
  simlFxamtAplyApreDt: string;
  simlFxamtNnaplyApntRsn: string;
  rgsrCstmNm: string;
}

// --- API017: 수출이행기간 단축대상 품목 ---

export interface ExportPeriodShortItem {
  hsSgn: string;
  ffmnTmlmDt: string;
  trgtImpEndDt: string;
  prnm: string;
  stszNm: string;
}

// --- API019: 통계부호 ---

export interface StatisticsCodeItem {
  statsSgn: string;
  englAbrt: string;
  koreAbrt: string;
  koreBrkd: string;
  itxRt: string;
}

// --- API023: 보세운송차량등록내역 ---

export interface BondedTransportVehicleItem {
  btcoSgn: string;
  bnbnTrnpVhclRgsrDt: string;
  bnbnTrnpEqipTpcd: string;
  vhclInfoSrno: string;
  vhclNoSanm: string;
  bnbnTrnpEqipTpcdNm: string;
  useYn: string;
}

// --- API024: 입출항보고내역 ---

export interface PortEntryExitItem {
  cstmSgn: string;
  shipFlgtNm: string;
  cstmNm: string;
  ioprSbmtNo: string;
  shipAirCntyNm: string;
  shipAirCntyCd: string;
  alCrmbPecnt: string;
  alPsngPecnt: string;
  etprDttm: string;
  tkofDttm: string;
  dptrPortAirptNm: string;
  arvlCntyPortAirptNm: string;
}

// --- API025: 통관단일창구 처리이력 ---

export interface SingleWindowHistoryItem {
  reqRqstNo: string;
  elctDocNm: string;
  reqRqstPrcsSttsNm: string;
  trsnTpNm: string;
  rcpnDttm: string;
}

// --- API026: 선박회사 목록 ---

export interface ShipCompanyListItem {
  shipCoEnglNm: string;
  shipCoKoreNm: string;
  shipCoSgn: string;
  rppnNm: string;
}

// --- API027: 선박회사 내역 ---

export interface ShipCompanyDetailItem {
  cntyNm: string;
  shipAgncNm: string;
  rppnNm: string;
  brno: string;
  shipCoNat: string;
  hdofAddr: string;
  agncAddr: string;
  telno: string;
  faxNo: string;
  rgsrNo: string;
  rgsrDt: string;
}

// --- API029: 세관장확인대상 물품 ---

export interface CustomsCheckItem {
  hsSgn: string;
  dcerCrmLworCd: string;
  dcerCfrmLworNm: string;
  reqApreIttCd: string;
  reqApreIttNm: string;
  aplyStrtDt: string;
  aplyEndDt: string;
  reqCfrmIstmNm: string;
}

// --- API031: 우편번호별 관할세관 ---

export interface PostalCustomsItem {
  jrsdCstmSgn: string;
  jrsdCstmSgnNm: string;
}

// --- API032: 전자첨부서류 제출 완료 유무 ---

export interface AttachmentSubmitItem {
  dclrBsopDtlTpcd: string;
  elctDocNm: string;
  dcshSbmtNo: string;
  sbmtDttm: string;
  attchSbmtYn: string;
}

// --- API034: 재수입조건부 수출 잔량 ---

export interface ReimportExportBalanceItem {
  stsz: string;
  ttwg: string;
  ttwgUt: string;
  useAqty: string;
  useAqtyUt: string;
  rsqty: string;
  rsqtyUt: string;
  drwbYn: string;
}

// --- API035: 수출신고필증 검증 ---

export interface ExportDeclarationVerifyItem {
  tCnt: string;
  vrfcRsltCn: string;
}

// --- API036: 수출이행내역(차대번호) ---

export interface ExportByVehicleItem {
  dclrDttm: string;
  cbno: string;
  vhclPrgsStts: string;
  expDclrNo: string;
}

// --- API037: 우편물통관 진행정보 ---

export interface PostalClearanceItem {
  psmtCsclMtNo: string;
  psmtNo: string;
  psmtPrcsTpcd: string;
  csclPsofCd: string;
  psmtKcd: string;
  brngArvlDt: string;
  sendCntyCdNm: string;
  ttwg: string;
  aprvDt: string;
  psmtPrcsStcd: string;
}

// --- API038: 하선신고 목록 ---

export interface UnloadingDeclarationItem {
  mrn: string;
  shipNm: string;
  ulvsUnairPrcsNm: string;
}

// --- API039: 출항허가(해상) ---

export interface SeaDeparturePermitItem {
  shipFlgtNm: string;
  shipAirCntyCd: string;
  shipCallImoNo: string;
  tkofDttm: string;
  arvlCntyPortAirptCd: string;
  loadWght: string;
  alCrmbPecnt: string;
  alPsngPecnt: string;
  aprePermDttm: string;
}

// --- API040: 출항허가(항공) ---

export interface AirDeparturePermitItem {
  shipFlgtNm: string;
  shipAirCntyCd: string;
  airRgsrNo: string;
  tkofDttm: string;
  arvlCntyPortAirptCd: string;
  dptrPortAirptCd: string;
  loadTtn: string;
  kornCrmbPecnt: string;
  kornPsngPecnt: string;
  prcsDttm: string;
}

// --- API042: 재수출면세 이행잔량 ---

export interface ReexportDutyFreeBalanceItem {
  impDclrNo: string;
  lnNo: string;
  dclrQty: string;
  dclrWght: string;
  totReexpFfmnQty: string;
  totReexpFfmnWght: string;
  qtyRsqty: string;
  wghtRsqty: string;
  reexpFfmnLastEnfrDt: string;
}

// --- API043: HS CODE 내비게이션 ---

export interface HsCodeNavigationItem {
  hs10Sgn: string;
  acrsTcntRnk: string;
  prlstNm: string;
  prlstLnCnt: string;
}

// --- API044: 입항보고내역(항공) ---

export interface AirArrivalReportItem {
  ioprSbmtNo: string;
  shipFlgtNm: string;
  shipAirCntyCd: string;
  etprDttm: string;
  dptrPortAirptCd: string;
  alCrmbPecnt: string;
  alPsngPecnt: string;
  cstmSgn: string;
  aprePermDttm: string;
  arvlCntyPortAirptCd: string;
}

// --- API045: 재수출조건부 수입의 수출이행 기한 ---

export interface ReexportDeadlineItem {
  xtnsDt: string;
}

// --- API046: 재수출 이행 완료보고 처리정보 ---

export interface ReexportCompletionItem {
  reexpFffmnPrcsStcd: string;
  reexpFfmnLastEnfrDt: string;
  lastReexpFfmnDtyConcRcd: string;
}

// --- API048: 수입물품 보세구역 반출신고 ---

export interface BondedReleaseItem {
  rlbrDt: string;
  rlbrYn: string;
}

// --- API050: 담보해제 신청 처리현황 ---

export interface CollateralReleaseItem {
  mgPrcsStcdNm: string;
  mgAprvDt: string;
  mgRqstDt: string;
}

// --- API051: 전자상거래수출 적재 이행 ---

export interface EcommerceExportLoadItem {
  loadCmplYn: string;
}

// --- API052: 수출입신고서 정정신청 처리상태 ---

export interface DeclarationCorrectionItem {
  mdfyRqstPrcsStcd: string;
  mdfyRqstPrcsStcdNm: string;
}

// --- API053: 적재지 검사정보 ---

export interface LoadingInspectionItem {
  expInscTrgtYn: string;
  expInscCmplYn: string;
}

// --- API054: 보세운송 운송차량정보 ---

export interface BondedTransportInfoItem {
  alocPrngDclrNo: string;
  bnbnTrnpDclrNo: string;
  frarSnarSgnNm: string;
  arlcSnarSgnNm: string;
  bntpMethNo: string;
  cntrNo: string;
}
