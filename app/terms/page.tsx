"use client";

import { useRouter } from "next/navigation";
import { COLORS } from "@/lib/constants";
import { LEGAL } from "@/lib/legal";

const { lastUpdated: LAST_UPDATED, providerName: PROVIDER_NAME, providerContact: PROVIDER_CONTACT, serviceName: SERVICE_NAME } = LEGAL;

export default function TermsPage() {
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
          이용약관
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
              1. 목적
            </h2>
            <p>
              본 약관은 &quot;{SERVICE_NAME}&quot;(이하 &quot;서비스&quot;)을 이용함에 있어 운영자와
              이용자 사이의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              2. 서비스의 내용
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>아이의 등원·취침 준비 루틴을 도와주는 타이머 및 시각화 기능</li>
              <li>가족 간 데이터 동기화(선택 사용)</li>
              <li>준비 기록 통계 제공</li>
            </ul>
            <p className="mt-2">
              서비스는 무료로 제공되며, 회원 가입이나 별도의 결제 절차가 없습니다. 광고 및 외부 추적
              기술을 포함하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              3. 약관의 효력 및 변경
            </h2>
            <p>
              본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 운영자는 필요한 경우 관련 법령을
              위배하지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 본 화면을 통해 공지합니다.
              이용자가 변경 후 서비스를 계속 이용하는 경우 변경된 약관에 동의한 것으로 봅니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              4. 이용자의 의무
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>관련 법령, 본 약관, 공지사항을 준수합니다.</li>
              <li>서비스 운영을 방해하는 행위(역공학, 자동화된 접근, 비정상적인 부하 유발 등)를 하지 않습니다.</li>
              <li>타인의 권리를 침해하는 콘텐츠를 가족 동기화 기능 등을 통해 입력하지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              5. 개인정보 보호
            </h2>
            <p>
              서비스의 개인정보 처리에 관한 사항은 별도의 개인정보 처리방침에 따릅니다. 본 서비스는
              회원 정보를 수집하지 않으며, 사용자가 입력한 루틴 데이터는 기기 내에 저장됩니다.
              가족 동기화 기능을 활성화한 경우에 한해, 사용자가 직접 만들거나 입력한 가족 코드를
              기준으로 데이터가 클라우드 데이터베이스에 저장됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              6. 서비스의 변경 및 중단
            </h2>
            <p>
              운영자는 운영상·기술상 필요에 의해 제공 중인 서비스의 일부 또는 전부를 변경하거나
              중단할 수 있습니다. 무료 서비스의 변경·중단으로 발생한 사항에 대해서는 관련 법령에
              특별한 규정이 없는 한 별도의 보상을 하지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              7. 면책
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>천재지변, 통신 장애, 단말기 오작동 등 운영자의 귀책이 아닌 사유로 서비스가
                중단되거나 데이터가 손실된 경우 운영자는 책임을 지지 않습니다.</li>
              <li>이용자가 서비스를 통해 얻은 정보로 인한 손해, 이용자 간 분쟁에 대해서는 운영자가
                개입하지 않으며 책임을 지지 않습니다.</li>
              <li>이용자가 기기 내 데이터를 직접 삭제하거나 앱을 삭제한 경우의 데이터 복구 책임은
                지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              8. 분쟁 해결 및 준거법
            </h2>
            <p>
              본 약관은 대한민국 법령을 따릅니다. 서비스 이용과 관련하여 운영자와 이용자 사이에
              분쟁이 발생한 경우 양 당사자는 우선 협의로 해결하며, 협의가 이루어지지 않을 경우
              민사소송법상의 관할법원에 소를 제기할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl font-bold mb-2" style={{ color: COLORS.primary }}>
              9. 문의
            </h2>
            <p>
              서비스 이용에 관한 문의는 <strong>{PROVIDER_CONTACT}</strong> 로 보내주세요.
              (운영자: {PROVIDER_NAME})
            </p>
          </section>

          <p className="text-xs" style={{ color: COLORS.textSub }}>
            ⚠️ 위 내용은 무료·무광고·무계정 서비스 운영 기준의 초안입니다. 사업자명·연락처 등은
            출시 전 실제 정보로 교체해 주세요.
          </p>
        </article>
      </div>
    </div>
  );
}
