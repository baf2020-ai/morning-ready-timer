"use client";

import { useRouter } from "next/navigation";
import { COLORS } from "@/lib/constants";
import { LEGAL } from "@/lib/legal";

const { lastUpdated: LAST_UPDATED, providerName: PROVIDER_NAME, providerContact: PROVIDER_CONTACT } = LEGAL;

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full paper-bg" style={{ backgroundColor: COLORS.bgPurple }}>
      <div
        className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4"
        style={{ backgroundColor: "#FFFFFF", borderBottom: `2px solid #F0EBFF` }}
      >
        <button
          onClick={() => router.back()}
          className="text-sm md:text-base px-3 md:px-4 py-1 md:py-1.5 rounded-full"
          style={{ color: COLORS.textSub, backgroundColor: "rgba(108,92,231,0.06)" }}
        >
          ← 뒤로
        </button>
        <h1 className="text-lg md:text-2xl" style={{ color: COLORS.primary }}>
          개인정보 처리방침
        </h1>
        <div className="w-10 md:w-16" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 w-full max-w-3xl mx-auto">
        <article
          className="sticker-card p-5 md:p-8 space-y-5 leading-relaxed text-sm md:text-base"
          style={{ transform: "rotate(0deg)", borderRadius: "20px", color: COLORS.textDark }}
        >
          <p style={{ color: COLORS.textSub }}>최종 갱신일: {LAST_UPDATED}</p>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              1. 수집·이용하는 정보
            </h2>
            <p>
              &quot;준비 히어로&quot; 앱은 회원가입 절차가 없으며 사용자에게 이름·이메일·전화번호 등
              개인 식별 정보를 요구하지 않습니다. 사용자가 직접 입력한 아이 이름, 캐릭터, 루틴 항목,
              완료 기록과 같은 정보는 기기 내부 저장소(localStorage)에 보관됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              2. 정보의 저장 위치
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>기본: 사용자의 기기 안에만 저장됩니다.</li>
              <li>
                선택: 사용자가 &quot;가족 코드&quot;를 만들거나 입력해 데이터 동기화를 활성화하면, 동일한
                코드를 공유한 다른 기기와 데이터를 주고받기 위해 Google Firebase Realtime Database에
                저장됩니다. 이때 저장되는 항목은 사용자가 앱에서 직접 입력한 루틴 설정과 완료 기록뿐
                입니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              3. 제3자 제공 및 위탁
            </h2>
            <p>
              앱은 수집한 정보를 제3자에게 판매·제공하지 않습니다. 데이터 동기화를 활성화한 경우
              저장 인프라로 Google Firebase가 사용되며, 이는 사용자가 입력한 가족 코드 범위 내에서만
              접근 가능합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              4. 보유 및 파기
            </h2>
            <p>
              기기 내 데이터는 사용자가 앱을 삭제하거나 설정에서 &quot;설정 초기화&quot;를 선택하는 즉시
              사라집니다. 동기화를 활성화한 경우 설정 화면의 &quot;연결 해제&quot;를 누르면 해당 기기와
              가족 코드의 연결이 끊기며, 가족 코드에 연결된 모든 기기에서 연결을 해제하면 원격 데이터도
              더 이상 사용되지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              5. 아동 개인정보
            </h2>
            <p>
              앱은 아동을 주요 사용자로 합니다. 그러나 식별 가능한 개인정보를 수집하지 않으며 광고,
              위치 추적, 분석 SDK를 포함하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              6. 권한
            </h2>
            <p>
              앱은 카메라, 마이크, 연락처, 위치 등 민감 권한을 요청하지 않습니다. 인터넷 접근은 데이터
              동기화 기능이 활성화된 경우에만 사용됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              7. 문의
            </h2>
            <p>
              개인정보 처리에 대한 문의는 <strong>{PROVIDER_CONTACT}</strong> 로 보내주세요.
              (운영자: {PROVIDER_NAME})
            </p>
          </section>

          <p className="text-xs" style={{ color: COLORS.textSub }}>
            ⚠️ 위 내용은 앱의 실제 동작에 맞춘 초안입니다. 사업자명·연락처 등은 출시 전 실제 정보로
            교체해주세요.
          </p>
        </article>
      </div>
    </div>
  );
}
